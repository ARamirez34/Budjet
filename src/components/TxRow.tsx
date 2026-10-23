import { Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryEmoji } from '../categories';
import { formatMoney, shortDate } from '../money';
import { colors } from '../theme';
import type { Account, Transaction } from '../types';
import { Bubble } from './ui';

// How each kind of entry looks. Transfers and card payments just move money, so no +/− sign.
const LOOK = {
  income: { emoji: '💰', title: 'Income', bg: colors.mint, fg: colors.mintDark, sign: '+' },
  expense: { emoji: '📦', title: 'Expense', bg: colors.peach, fg: colors.coral, sign: '−' },
  transfer: { emoji: '🔁', title: 'Transfer', bg: colors.sky, fg: colors.skyDark, sign: '' },
  cardPayment: { emoji: '💳', title: 'Card payment', bg: colors.lavender, fg: colors.primary, sign: '' },
};

// One transaction: emoji bubble, what it was, which account(s), and the amount.
export function TxRow({ tx, accounts, onPress }: { tx: Transaction; accounts: Account[]; onPress?: () => void }) {
  const nameOf = (id?: string) => accounts.find((a) => a.id === id)?.name ?? 'Deleted account';
  const look = LOOK[tx.type];

  const emoji = tx.type === 'expense' ? categoryEmoji(tx.category) : look.emoji;
  const title = tx.note || (tx.type === 'expense' ? tx.category : undefined) || look.title;
  const where = tx.toAccountId ? `${nameOf(tx.accountId)} → ${nameOf(tx.toAccountId)}` : nameOf(tx.accountId);

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <Bubble color={look.bg}>
        <Text style={{ fontSize: 20 }}>{emoji}</Text>
      </Bubble>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.sub} numberOfLines={1}>
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

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '800', marginLeft: 8 },
});
