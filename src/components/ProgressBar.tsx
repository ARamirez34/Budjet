import { StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../money';
import { colors } from '../theme';

// "$210 of $300 spent this month — $90 left". Green, then yellow at 80%, red when over.
export function ProgressBar({ spent, limit }: { spent: number; limit: number }) {
  const ratio = limit > 0 ? spent / limit : 0;
  const color = ratio > 1 ? colors.red : ratio >= 0.8 ? colors.yellow : colors.green;
  const left = limit - spent;

  return (
    <View>
      <Text style={styles.text}>
        <Text style={styles.bold}>{formatMoney(spent)}</Text> of {formatMoney(limit)} spent this month
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(ratio, 1) * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.left, { color: left < 0 ? colors.red : colors.muted }]}>
        {left >= 0 ? `${formatMoney(left)} left` : `${formatMoney(-left)} over the limit`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 15, color: colors.text },
  bold: { fontWeight: '700' },
  track: { height: 12, borderRadius: 6, backgroundColor: colors.lavender, marginVertical: 10, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  left: { fontSize: 14, fontWeight: '600' },
});
