import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { iconFor } from '../categories';
import { formatMoney, shortDate } from '../money';
import { useData } from '../store';
import { useColors, type Colors } from '../theme';
import type { Transaction } from '../types';
import { Bubble } from './ui';

// How each kind of entry looks. Transfers and card payments just move money, so no +/− sign.
const lookFor = (colors: Colors) => ({
  income: { icon: 'cash-outline', title: 'Income', bg: colors.mint, fg: colors.mintDark, sign: '+' },
  expense: { icon: 'cube-outline', title: 'Expense', bg: colors.peach, fg: colors.coral, sign: '−' },
  transfer: { icon: 'swap-horizontal', title: 'Transfer', bg: colors.sky, fg: colors.skyDark, sign: '' },
  cardPayment: { icon: 'card-outline', title: 'Card payment', bg: colors.lavender, fg: colors.primary, sign: '' },
} as const);

// One transaction: icon bubble, what it was, which account(s), and the amount.
export function TxRow({ tx, onPress }: { tx: Transaction; onPress?: () => void }) {
  const { accounts, categories } = useData();
  const colors = useColors();
  const styles = makeStyles(colors);
  const look = lookFor(colors)[tx.type];

  const nameOf = (id?: string) => accounts.find((a) => a.id === id)?.name ?? 'Deleted account';
  const icon = tx.type === 'expense' ? iconFor(categories, tx.category) : look.icon;
  const title = tx.note || (tx.type === 'expense' ? tx.category : undefined) || look.title;
  const where = tx.toAccountId ? `${nameOf(tx.accountId)} → ${nameOf(tx.toAccountId)}` : nameOf(tx.accountId);

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <Bubble color={look.bg}>
        <Ionicons name={icon} size={20} color={look.fg} />
      </Bubble>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.sub} numberOfLines={1}>
          {tx.billId ? 'Bill · ' : ''}
          {where} · {shortDate(tx.date)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: look.fg }]}>
        {look.sign}
        {formatMoney(tx.amount)}
      </Text>
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    title: { fontSize: 16, fontWeight: '700', color: colors.text },
    sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
    amount: { fontSize: 16, fontWeight: '800', marginLeft: 8 },
  });
