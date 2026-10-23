// One month at a glance: income vs. expenses, and where the spending went.
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MonthPicker } from '@/components/MonthPicker';
import { Card, SectionTitle } from '@/components/ui';
import { categoryEmoji } from '@/categories';
import { formatMoney, monthIncome, monthOf, monthSpending, spendingByCategory, today } from '@/money';
import { useData } from '@/store';
import { colors } from '@/theme';

// A rotating set of pastel bar colors, one per category row.
const BAR_COLORS = [colors.primary, colors.coral, colors.skyDark, colors.mintDark, colors.yellow];

export default function SummaryScreen() {
  const { transactions } = useData();
  const [month, setMonth] = useState(monthOf(today()));

  const income = monthIncome(transactions, month);
  const spent = monthSpending(transactions, month);
  const left = income - spent;
  const categories = spendingByCategory(transactions, month);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <MonthPicker month={month} onChange={setMonth} />

      <View style={styles.tiles}>
        <Tile label="💰 Income" value={formatMoney(income)} bg={colors.mint} fg={colors.mintDark} />
        <Tile label="🧾 Expenses" value={formatMoney(spent)} bg={colors.peach} fg={colors.coral} />
      </View>
      <Card style={{ backgroundColor: colors.lavender }}>
        <Text style={styles.leftLabel}>{left >= 0 ? 'You kept 🎉' : 'You spent more than you earned'}</Text>
        <Text style={[styles.leftValue, left < 0 && { color: colors.red }]}>{formatMoney(Math.abs(left))}</Text>
      </Card>

      <SectionTitle>Spending by category</SectionTitle>
      <Card>
        {categories.length === 0 ? (
          <Text style={{ color: colors.muted }}>No expenses this month 🌿</Text>
        ) : (
          categories.map((c, i) => {
            const share = spent > 0 ? c.total / spent : 0;
            return (
              <View key={c.name} style={{ marginBottom: 14 }}>
                <View style={styles.catRow}>
                  <Text style={styles.catName}>
                    {categoryEmoji(c.name)} {c.name}
                  </Text>
                  <Text style={styles.catAmount}>
                    {formatMoney(c.total)} <Text style={styles.pct}>· {Math.round(share * 100)}%</Text>
                  </Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${share * 100}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }]} />
                </View>
              </View>
            );
          })
        )}
      </Card>
    </ScrollView>
  );
}

function Tile({ label, value, bg, fg }: { label: string; value: string; bg: string; fg: string }) {
  return (
    <View style={[styles.tile, { backgroundColor: bg }]}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={[styles.tileValue, { color: fg }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  tile: { flex: 1, borderRadius: 20, padding: 16 },
  tileLabel: { fontSize: 13, fontWeight: '700', color: colors.muted },
  tileValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  leftLabel: { fontSize: 14, fontWeight: '700', color: colors.primary },
  leftValue: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: 4 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catName: { fontSize: 15, fontWeight: '700', color: colors.text },
  catAmount: { fontSize: 15, fontWeight: '700', color: colors.text },
  pct: { color: colors.muted, fontWeight: '600' },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.lavender, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
});
