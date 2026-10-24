// Monthly bill reminders. They don't change any balance until you add one as an expense.
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bubble, Button, Card } from '@/components/ui';
import { isDone, nextDue, ordinal } from '@/bills';
import { Ionicons } from '@expo/vector-icons';
import { iconFor } from '@/categories';
import { formatMoney, monthName, monthOf, shortDate, today } from '@/money';
import { useData } from '@/store';
import { useColors, type Colors } from '@/theme';
import type { Bill } from '@/types';

export default function BillsScreen() {
  const { bills, accounts, categories, addBillExpense } = useData();
  const colors = useColors();
  const styles = makeStyles(colors);
  const month = monthOf(today());

  const sorted = [...bills].sort((a, b) => a.day - b.day);
  const total = bills.reduce((sum, b) => sum + b.amount, 0);

  function confirmAdd(bill: Bill) {
    const from = accounts.find((a) => a.id === bill.accountId)?.name ?? 'its account';
    Alert.alert(`Add ${bill.name} as an expense?`, `${formatMoney(bill.amount)} from ${from}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Add', onPress: () => addBillExpense(bill) },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Card style={{ backgroundColor: colors.lavender }}>
        <Text style={styles.bigLabel}>Bills per month</Text>
        <Text style={styles.big}>{formatMoney(total)}</Text>
        <Text style={styles.note}>{bills.length === 0 ? 'Add rent, phone, subscriptions…' : `${bills.length} bill(s)`}</Text>
      </Card>

      {sorted.length > 0 && (
        <Card>
          {sorted.map((b) => {
            const done = isDone(b, month);
            const from = accounts.find((a) => a.id === b.accountId)?.name ?? 'Deleted account';
            return (
              <Pressable
                key={b.id}
                onPress={() => router.push({ pathname: '/bill-form', params: { id: b.id } })}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
              >
                <Bubble color={done ? colors.mint : colors.peach}>
                  <Ionicons name={iconFor(categories, b.category)} size={20} color={done ? colors.mintDark : colors.coral} />
                </Bubble>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>{b.name}</Text>
                  <Text style={styles.sub} numberOfLines={1}>
                    {done ? `✓ Done for ${monthName(month).split(' ')[0]}` : `Due ${shortDate(nextDue(b).date)}`} · {from}
                  </Text>
                  <Text style={styles.sub}>Every month on the {ordinal(b.day)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={styles.amount}>{formatMoney(b.amount)}</Text>
                  {!done && (
                    <Pressable accessibilityRole="button" onPress={() => confirmAdd(b)} hitSlop={8} style={styles.addPill}>
                      <Text style={styles.addText}>Add expense</Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          })}
        </Card>
      )}

      <Text style={[styles.note, { marginBottom: 16 }]}>
        Bills are reminders. They don't change any balance until you add one as an expense. Home asks you a few days
        before each one is due.
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <Button title="Add bill" icon="add-circle" onPress={() => router.push('/bill-form')} />
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    bigLabel: { fontSize: 14, color: colors.primary, fontWeight: '700' },
    big: { fontSize: 36, fontWeight: '800', color: colors.text, marginVertical: 4 },
    note: { fontSize: 13, color: colors.muted, fontWeight: '600' },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    name: { fontSize: 16, fontWeight: '700', color: colors.text },
    sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
    amount: { fontSize: 16, fontWeight: '800', color: colors.text },
    addPill: { backgroundColor: colors.lavender, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
    addText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  });
