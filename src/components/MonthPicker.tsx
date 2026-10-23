import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { monthName, shiftMonth } from '../money';
import { colors } from '../theme';

// ‹ October 2026 ›
export function MonthPicker({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  return (
    <View style={styles.row}>
      <Arrow icon="chevron-back" label="Previous month" onPress={() => onChange(shiftMonth(month, -1))} />
      <Text style={styles.month}>{monthName(month)}</Text>
      <Arrow icon="chevron-forward" label="Next month" onPress={() => onChange(shiftMonth(month, 1))} />
    </View>
  );
}

type ArrowProps = { icon: 'chevron-back' | 'chevron-forward'; label: string; onPress: () => void };

function Arrow({ icon, label, onPress }: ArrowProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.arrow}>
      <Ionicons name={icon} size={20} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  month: { fontSize: 18, fontWeight: '800', color: colors.text },
  arrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
});
