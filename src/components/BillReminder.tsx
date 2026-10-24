// "Hey, Rent is coming up. Add it as an expense?" Shown on Home a few days before a bill is due.
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { nextDue } from '../bills';
import { iconFor } from '../categories';
import { formatMoney, shortDate, today } from '../money';
import { useData } from '../store';
import { useColors, type Colors } from '../theme';
import type { Bill } from '../types';
import { Bubble } from './ui';

export function BillReminder({ bill }: { bill: Bill }) {
  const { accounts, categories, addBillExpense, skipBill } = useData();
  const colors = useColors();
  const styles = makeStyles(colors);
  const { date } = nextDue(bill);
  const from = accounts.find((a) => a.id === bill.accountId)?.name ?? 'Deleted account';
  const when = date < today() ? `was due ${shortDate(date)}` : date === today() ? 'is due today' : `is due ${shortDate(date)}`;

  return (
    <View style={styles.wrap}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Bubble color={colors.peach}>
          <Ionicons name={iconFor(categories, bill.category)} size={20} color={colors.coral} />
        </Bubble>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {bill.name} {when}
          </Text>
          <Text style={styles.sub}>
            {formatMoney(bill.amount)} from {from}. Add it as an expense?
          </Text>
        </View>
      </View>
      <View style={styles.buttons}>
        <Pressable accessibilityRole="button" onPress={() => addBillExpense(bill)} style={[styles.btn, { backgroundColor: colors.primary }]}>
          <Text style={[styles.btnText, { color: '#fff' }]}>Add expense</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => skipBill(bill)} style={[styles.btn, { backgroundColor: colors.lavender }]}>
          <Text style={[styles.btnText, { color: colors.primary }]}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    wrap: { paddingVertical: 10 },
    title: { fontSize: 16, fontWeight: '700', color: colors.text },
    sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
    buttons: { flexDirection: 'row', gap: 8, marginTop: 10, marginLeft: 54 },
    btn: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 },
    btnText: { fontWeight: '700', fontSize: 14 },
  });
