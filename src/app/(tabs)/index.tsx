import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { isComingUp } from '@/bills';
import { BillReminder } from '@/components/BillReminder';
import { ProgressBar } from '@/components/ProgressBar';
import { TxRow } from '@/components/TxRow';
import { Button, Card, SectionTitle } from '@/components/ui';
import { balance, formatMoney, freeToSpend, monthOf, monthSpending, newestFirst, today, totals } from '@/money';
import { useData } from '@/store';
import { useColors, type Colors } from '@/theme';
import type { TxType } from '@/types';

const openForm = (type: TxType) => router.push({ pathname: '/transaction-form', params: { type } });

export default function HomeScreen() {
  const { accounts, transactions, bills, settings } = useData();
  const colors = useColors();
  const styles = makeStyles(colors);
  const month = monthOf(today());
  const { debt, net } = totals(accounts, transactions);
  const free = freeToSpend(accounts, transactions, settings.checkingCushion);
  const [showMath, setShowMath] = useState(false);
  const checkingAccounts = accounts.filter((a) => a.type === 'checking');
  const comingUp = bills.filter((b) => isComingUp(b, today()));
  const spent = monthSpending(transactions, month);
  const recent = newestFirst(transactions).slice(0, 5);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={showMath ? 'Hide the Budjet math' : 'Show how Budjet is calculated'}
        onPress={() => setShowMath(!showMath)}
      >
        <Card style={{ backgroundColor: colors.lavender }}>
          <Text style={styles.bigLabel}><Ionicons name="sparkles" size={14} color={colors.primary} /> Budjet</Text>
          <Text style={[styles.big, free < 0 && { color: colors.red }]}>{formatMoney(free)}</Text>

          {showMath ? (
            // Every number that goes into the Budjet, so you can check it after any change.
            <View style={styles.math}>
              {checkingAccounts.map((a) => (
                <MathLine key={a.id} label={a.name} value={balance(a, transactions)} />
              ))}
              <MathLine label="Cushion" value={-settings.checkingCushion} />
              <MathLine label="= Budjet" value={free} bold />
              {debt > 0 && (
                <>
                  <MathLine label="Card debt" value={-debt} />
                  <MathLine label="= After paying off cards" value={free - debt} bold />
                </>
              )}
              <Text style={styles.hint}>Only checking accounts count toward your Budjet.</Text>
            </View>
          ) : (
            debt > 0 && <Text style={styles.bigNote}>{formatMoney(free - debt)} after paying off your cards</Text>
          )}
          <Text style={styles.hint}>{showMath ? 'Tap to hide' : 'Tap to see the math'}</Text>

          <View style={styles.row}>
            <Stat icon="stats-chart-outline" label="Net" value={formatMoney(net)} color={net < 0 ? colors.red : undefined} />
            <Stat icon="card-outline" label="Card debt" value={formatMoney(debt)} color={debt > 0 ? colors.coral : undefined} />
          </View>
        </Card>
      </Pressable>

      {comingUp.length > 0 && (
        <Card>
          <Text style={styles.bigLabel}><Ionicons name="notifications-outline" size={14} color={colors.primary} /> Coming up</Text>
          {comingUp.map((b) => (
            <BillReminder key={b.id} bill={b} />
          ))}
        </Card>
      )}

      {accounts.length === 0 && (
        <Card>
          <Text style={styles.empty}>Welcome! Add your first account to get started.</Text>
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
          <Text style={styles.hint}><Ionicons name="create-outline" size={12} color={colors.muted} /> Tap to change your limit</Text>
        </Card>
      </Pressable>

      <SectionTitle>Recent</SectionTitle>
      <Card>
        {recent.length === 0 ? (
          <Text style={styles.empty}>Nothing here yet. Tap Income or Expense above.</Text>
        ) : (
          recent.map((t) => (
            <TxRow key={t.id} tx={t} onPress={() => router.push({ pathname: '/transaction-form', params: { id: t.id } })} />
          ))
        )}
      </Card>
    </ScrollView>
  );
}

type StatProps = { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; color?: string };

function Stat({ icon, label, value, color }: StatProps) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>
        <Ionicons name={icon} size={13} color={colors.muted} /> {label}
      </Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

// One line of the Budjet math: label on the left, amount on the right.
function MathLine({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  const styles = makeStyles(useColors());
  return (
    <View style={styles.mathLine}>
      <Text style={[styles.mathText, bold && styles.mathBold]} numberOfLines={1}>{label}</Text>
      <Text style={[styles.mathText, bold && styles.mathBold]}>{formatMoney(value)}</Text>
    </View>
  );
}

// A smaller, lighter button for the less common actions.
type PillProps = { icon: keyof typeof Ionicons.glyphMap; title: string; color: string; onPress: () => void };

function Pill({ icon, title, color, onPress }: PillProps) {
  const styles = makeStyles(useColors());
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.pill, pressed && { opacity: 0.6 }]}>
      <Ionicons name={icon} size={18} color={color} style={{ marginRight: 6 }} />
      <Text style={{ color, fontWeight: '700' }}>{title}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    bigLabel: { fontSize: 14, color: colors.primary, fontWeight: '700' },
    big: { fontSize: 40, fontWeight: '800', color: colors.text, marginVertical: 4 },
    bigNote: { fontSize: 13, color: colors.muted, fontWeight: '600' },
    row: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
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
    math: { marginTop: 8, gap: 6 },
    mathLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    mathText: { fontSize: 14, color: colors.text, flexShrink: 1 },
    mathBold: { fontWeight: '800' },
  });
