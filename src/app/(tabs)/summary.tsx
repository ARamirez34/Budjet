// One month at a glance: income vs. expenses, and where the spending went.
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MonthPicker } from '@/components/MonthPicker';
import { Card, SectionTitle } from '@/components/ui';
import { iconFor, type IconName } from '@/categories';
import { formatMoney, monthExpenses, monthIncome, monthOf, spendingByCategory, today } from '@/money';
import { useData } from '@/store';
import { useColors, type Colors } from '@/theme';

export default function SummaryScreen() {
  const { transactions, categories } = useData();
  const colors = useColors();
  const styles = makeStyles(colors);
  const [month, setMonth] = useState(monthOf(today()));

  const income = monthIncome(transactions, month);
  const spent = monthExpenses(transactions, month); // includes bills you added as expenses
  const left = income - spent;
  const byCategory = spendingByCategory(transactions, month);
  // A rotating set of bar colors, one per category row.
  const barColors = [colors.primary, colors.coral, colors.skyDark, colors.mintDark, colors.yellow];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <MonthPicker month={month} onChange={setMonth} />

      <View style={styles.tiles}>
        <Tile icon="arrow-down-circle-outline" label="Income" value={formatMoney(income)} bg={colors.mint} fg={colors.mintDark} />
        <Tile icon="arrow-up-circle-outline" label="Expenses" value={formatMoney(spent)} bg={colors.peach} fg={colors.coral} />
      </View>
      <Card style={{ backgroundColor: colors.lavender }}>
        <Text style={styles.leftLabel}>{left >= 0 ? 'You kept' : 'You spent more than you earned'}</Text>
        <Text style={[styles.leftValue, left < 0 && { color: colors.red }]}>{formatMoney(Math.abs(left))}</Text>
      </Card>

      <SectionTitle>Spending by category</SectionTitle>
      <Card>
        {byCategory.length === 0 ? (
          <Text style={{ color: colors.muted }}>No expenses this month</Text>
        ) : (
          byCategory.map((c, i) => {
            const share = spent > 0 ? c.total / spent : 0;
            const barColor = barColors[i % barColors.length];
            return (
              <View key={c.name} style={{ marginBottom: 14 }}>
                <View style={styles.catRow}>
                  <View style={styles.catName}>
                    <Ionicons name={iconFor(categories, c.name)} size={16} color={barColor} />
                    <Text style={styles.catText}>{c.name}</Text>
                  </View>
                  <Text style={styles.catText}>
                    {formatMoney(c.total)} <Text style={styles.pct}>· {Math.round(share * 100)}%</Text>
                  </Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${share * 100}%`, backgroundColor: barColor }]} />
                </View>
              </View>
            );
          })
        )}
      </Card>
    </ScrollView>
  );
}

type TileProps = { icon: IconName; label: string; value: string; bg: string; fg: string };

function Tile({ icon, label, value, bg, fg }: TileProps) {
  const styles = makeStyles(useColors());
  return (
    <View style={[styles.tile, { backgroundColor: bg }]}>
      <View style={styles.catName}>
        <Ionicons name={icon} size={16} color={fg} />
        <Text style={styles.tileLabel}>{label}</Text>
      </View>
      <Text style={[styles.tileValue, { color: fg }]}>{value}</Text>
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    tiles: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    tile: { flex: 1, borderRadius: 20, padding: 16 },
    tileLabel: { fontSize: 13, fontWeight: '700', color: colors.muted },
    tileValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
    leftLabel: { fontSize: 14, fontWeight: '700', color: colors.primary },
    leftValue: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: 4 },
    catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    catName: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    catText: { fontSize: 15, fontWeight: '700', color: colors.text },
    pct: { color: colors.muted, fontWeight: '600' },
    track: { height: 10, borderRadius: 5, backgroundColor: colors.lavender, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 5 },
  });
