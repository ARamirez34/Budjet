import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '@/components/ProgressBar';
import { TxRow } from '@/components/TxRow';
import { Button, Card, SectionTitle } from '@/components/ui';
import { formatMoney, freeToSpend, monthOf, monthSpending, newestFirst, today, totals } from '@/money';
import { useData } from '@/store';
import { colors } from '@/theme';
import type { TxType } from '@/types';

const openForm = (type: TxType) => router.push({ pathname: '/transaction-form', params: { type } });

export default function HomeScreen() {
  const { accounts, transactions, settings } = useData();
  const { debt, net } = totals(accounts, transactions);
  const free = freeToSpend(accounts, transactions, settings.checkingCushion);
  const spent = monthSpending(transactions, monthOf(today()));
  const recent = newestFirst(transactions).slice(0, 5);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Card style={{ backgroundColor: colors.lavender }}>
        <Text style={styles.bigLabel}>Budjet ✨</Text>
        <Text style={[styles.big, free < 0 && { color: colors.red }]}>{formatMoney(free)}</Text>
        {free < 0 && (
          <Text style={styles.bigNote}>Below your {formatMoney(settings.checkingCushion)} checking cushion</Text>
        )}
        {debt > 0 && <Text style={styles.bigNote}>{formatMoney(free - debt)} after paying off your cards</Text>}
        <View style={styles.row}>
          <Stat label="📊 Net" value={formatMoney(net)} color={net < 0 ? colors.red : undefined} />
          <Stat label="💳 Card debt" value={formatMoney(debt)} color={debt > 0 ? colors.coral : undefined} />
        </View>
      </Card>

      {accounts.length === 0 && (
        <Card>
          <Text style={styles.empty}>Welcome! Add your first account to get started 🌱</Text>
          <View style={{ flexDirection: 'row' }}>
            <Button title="Add account" icon="add-circle" onPress={() => router.push('/account-form')} />
          </View>
        </Card>
      )}

      <View style={styles.buttons}>
        <Button title="Income" icon="add-circle" color={colors.mint} textColor={colors.mintDark} onPress={() => openForm('income')} />
        <Button title="Expense" icon="remove-circle" color={colors.peach} textColor={colors.coral} onPress={() => openForm('expense')} />
      </View>
      <View style={styles.buttons}>
        <Pill icon="swap-horizontal" title="Transfer" color={colors.skyDark} onPress={() => openForm('transfer')} />
        <Pill icon="card" title="Pay card" color={colors.primary} onPress={() => openForm('cardPayment')} />
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Change monthly limit" onPress={() => router.push('/settings')}>
        <Card>
          <ProgressBar spent={spent} limit={settings.monthlyLimit} />
          <Text style={styles.hint}>✏️ Tap to change your limit</Text>
        </Card>
      </Pressable>

      <SectionTitle>Recent</SectionTitle>
      <Card>
        {recent.length === 0 ? (
          <Text style={styles.empty}>Nothing here yet. Tap Income or Expense above.</Text>
        ) : (
          recent.map((t) => (
            <TxRow
              key={t.id}
              tx={t}
              accounts={accounts}
              onPress={() => router.push({ pathname: '/transaction-form', params: { id: t.id } })}
            />
          ))
        )}
      </Card>
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

// A smaller, lighter button for the less common actions.
type PillProps = { icon: keyof typeof Ionicons.glyphMap; title: string; color: string; onPress: () => void };

function Pill({ icon, title, color, onPress }: PillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pill, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name={icon} size={18} color={color} style={{ marginRight: 6 }} />
      <Text style={{ color, fontWeight: '700' }}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bigLabel: { fontSize: 14, color: colors.primary, fontWeight: '700' },
  big: { fontSize: 40, fontWeight: '800', color: colors.text, marginVertical: 4 },
  bigNote: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  row: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#DCD4FF' },
  statLabel: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 2 },
  buttons: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  empty: { color: colors.muted, marginBottom: 12 },
  hint: { fontSize: 12, color: colors.muted, marginTop: 8 },
});
