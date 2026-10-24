// Small building blocks reused by every screen.
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { radius, useColors, type Colors } from '../theme';

// Padding for form screens (leaves breathing room under the header).
export const formStyle = { padding: 20, paddingTop: 28 };

// Styles depend on light/dark mode, so every component builds them from the current colors.
const useStyles = () => makeStyles(useColors());

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const styles = useStyles();
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

// A round pastel bubble holding an icon.
export function Bubble({ children, color }: { children: ReactNode; color: string }) {
  const styles = useStyles();
  return <View style={[styles.bubble, { backgroundColor: color }]}>{children}</View>;
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  color?: string; // background
  textColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  outline?: boolean;
};

export function Button({ title, onPress, color, textColor = '#fff', icon, outline }: ButtonProps) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const bg = color ?? colors.primary;
  const fg = outline ? bg : textColor;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        outline ? { borderWidth: 1.5, borderColor: bg } : { backgroundColor: bg },
        pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
      ]}
    >
      {icon && <Ionicons name={icon} size={20} color={fg} style={{ marginRight: 6 }} />}
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

// A labeled text box.
export function Field({ label, ...input }: { label: string } & TextInputProps) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} style={styles.input} {...input} />
    </View>
  );
}

// Pick one option from a row of pills. Used instead of a dropdown.
type ChipsProps<T extends string> = {
  label: string;
  options: { value: T; label: string; icon?: keyof typeof Ionicons.glyphMap }[];
  value: T | undefined;
  onChange: (v: T) => void;
  disabled?: boolean;
};

export function Chips<T extends string>({ label, options, value, onChange, disabled }: ChipsProps<T>) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled }}
              onPress={() => onChange(o.value)}
              style={[styles.chip, selected && styles.chipSelected, disabled && !selected && { opacity: 0.4 }]}
            >
              {o.icon && <Ionicons name={o.icon} size={16} color={selected ? '#fff' : colors.primary} />}
              <Text style={{ color: selected ? '#fff' : colors.text, fontWeight: '600' }}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius,
      padding: 18,
      marginBottom: 16,
      // soft shadow
      shadowColor: '#7C6CF2',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 10, marginTop: 4 },
    bubble: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    button: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', flex: 1 },
    buttonText: { fontSize: 16, fontWeight: '700' },
    label: { fontSize: 14, fontWeight: '700', color: colors.muted, marginBottom: 8 },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      fontSize: 16,
      color: colors.text,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 999,
      backgroundColor: colors.lavender,
    },
    chipSelected: { backgroundColor: colors.primary },
  });
