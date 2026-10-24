import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../money';
import { useColors, type Colors } from '../theme';
import type { Account } from '../types';
import { Bubble } from './ui';

// Each account type gets its own pastel look.
const lookFor = (colors: Colors) => ({
  checking: { icon: 'wallet-outline', bg: colors.mint, fg: colors.mintDark, name: 'Checking' },
  savings: { icon: 'leaf-outline', bg: colors.sky, fg: colors.skyDark, name: 'Savings' },
  credit: { icon: 'card-outline', bg: colors.peach, fg: colors.coral, name: 'Credit card' },
} as const);

// One account with its current balance. Cards also show utilization (owed / limit).
export function AccountRow({ account, balance, onPress }: { account: Account; balance: number; onPress?: () => void }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const look = lookFor(colors)[account.type];
  const isCard = account.type === 'credit';
  const usage = isCard && account.creditLimit ? balance / account.creditLimit : 0;

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <Bubble color={look.bg}>
        <Ionicons name={look.icon} size={20} color={look.fg} />
      </Bubble>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{account.name}</Text>
        <Text style={styles.sub}>
          {isCard ? `${Math.round(usage * 100)}% of ${formatMoney(account.creditLimit ?? 0)} limit` : look.name}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.amount, isCard && balance > 0 && { color: colors.coral }]}>{formatMoney(balance)}</Text>
        {isCard && <Text style={styles.sub}>owed</Text>}
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    name: { fontSize: 16, fontWeight: '700', color: colors.text },
    sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
    amount: { fontSize: 16, fontWeight: '800', color: colors.text },
  });
