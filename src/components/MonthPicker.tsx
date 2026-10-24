import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { monthName, shiftMonth } from '../money';
import { useColors, type Colors } from '../theme';

// ‹ October 2026 ›
export function MonthPicker({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const arrow = (icon: 'chevron-back' | 'chevron-forward', label: string, n: number) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => onChange(shiftMonth(month, n))} style={styles.arrow}>
      <Ionicons name={icon} size={20} color={colors.primary} />
    </Pressable>
  );

  return (
    <View style={styles.row}>
      {arrow('chevron-back', 'Previous month', -1)}
      <Text style={styles.month}>{monthName(month)}</Text>
      {arrow('chevron-forward', 'Next month', 1)}
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    month: { fontSize: 18, fontWeight: '800', color: colors.text },
    arrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  });
