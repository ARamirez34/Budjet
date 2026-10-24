// Add or edit any entry: income, expense, transfer or card payment.
// Open with ?type=income|expense|transfer|cardPayment, or ?id= to edit one.
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Chips, Field, formStyle } from '@/components/ui';
import { iconFor } from '@/categories';
import { balance, formatMoney, fromYMD, parseMoney, shortDate, today, toYMD } from '@/money';
import { newId, useData } from '@/store';
import { useColors, type Colors } from '@/theme';
import type { Account, TxType } from '@/types';

// Everything that differs between the four kinds of entry.
type Kind = {
  name: string;
  from: string; // label for the first account picker
  to?: string; // label for the second one (transfers and card payments only)
  button: string;
  color: keyof Colors;
  canBeFrom: (a: Account) => boolean;
  canBeTo?: (a: Account) => boolean;
  missing: string; // shown when you don't have the accounts this needs
};

const KINDS: Record<TxType, Kind> = {
  income: {
    name: 'income', from: 'Goes into', button: 'Add income', color: 'mintDark',
    canBeFrom: (a: Account) => a.type !== 'credit',
    missing: 'Add a checking or savings account first.',
  },
  expense: {
    name: 'expense', from: 'Paid with', button: 'Add expense', color: 'coral',
    canBeFrom: (a: Account) => a.type !== 'savings',
    missing: 'Add a checking account or credit card first.',
  },
  transfer: {
    name: 'transfer', from: 'From', to: 'To', button: 'Transfer', color: 'skyDark',
    canBeFrom: (a: Account) => a.type !== 'credit',
    canBeTo: (a: Account) => a.type !== 'credit',
    missing: 'You need at least two checking or savings accounts to transfer.',
  },
  cardPayment: {
    name: 'card payment', from: 'Pay from', to: 'Card', button: 'Pay card', color: 'primary',
    canBeFrom: (a: Account) => a.type === 'checking',
    canBeTo: (a: Account) => a.type === 'credit',
    missing: 'You need a checking account and a credit card to make a payment.',
  },
};

export default function TransactionForm() {
  const params = useLocalSearchParams<{ type?: TxType; id?: string }>();
  const { accounts, transactions, categories, saveTransaction, deleteTransaction } = useData();
  const colors = useColors();
  const existing = transactions.find((t) => t.id === params.id);
  const type = existing?.type ?? params.type ?? 'expense';
  const kind = KINDS[type];
  const { canBeTo } = kind;

  const fromChoices = accounts.filter(kind.canBeFrom);
  const [accountId, setAccountId] = useState(existing?.accountId ?? fromChoices[0]?.id);
  // Can't transfer from an account into itself.
  const toChoices = canBeTo ? accounts.filter((a) => canBeTo(a) && a.id !== accountId) : [];
  const [toAccountId, setToAccountId] = useState(existing?.toAccountId ?? toChoices[0]?.id);

  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [category, setCategory] = useState(existing?.category ?? categories[0]?.name ?? 'Other');
  const [note, setNote] = useState(existing?.note ?? '');
  const [date, setDate] = useState(existing?.date ?? today());
  const [showPicker, setShowPicker] = useState(false); // Android only: the picker is a pop-up dialog

  function save() {
    const value = parseMoney(amount);
    if (!(value > 0)) return Alert.alert('Please enter an amount above $0.');
    if (!accountId) return Alert.alert('Please choose an account.');
    // Typed dates (web) can be anything; a real date survives the round trip, "2026-02-30" doesn't.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || toYMD(fromYMD(date)) !== date) return Alert.alert('Please enter a real date, like 2026-10-23.');
    if (canBeTo && !toChoices.some((a) => a.id === toAccountId)) return Alert.alert(`Please choose the "${kind.to}" account.`);

    saveTransaction({
      id: existing?.id ?? newId(),
      type,
      amount: value,
      accountId,
      toAccountId: canBeTo ? toAccountId : undefined,
      category: type === 'expense' ? category : undefined,
      note: note.trim(),
      date,
      billId: existing?.billId, // keep the bill link when editing a bill payment
    });
    router.back();
  }

  function confirmDelete() {
    if (!existing) return;
    Alert.alert('Delete this entry?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => (deleteTransaction(existing.id), router.back()) },
    ]);
  }

  const title = `${existing ? 'Edit' : 'New'} ${kind.name}`;

  if (fromChoices.length === 0 || (canBeTo && accounts.filter(canBeTo).length === 0) || (type === 'transfer' && fromChoices.length < 2)) {
    return (
      <View style={formStyle}>
        <Stack.Screen options={{ title }} />
        <Text style={{ color: colors.muted, marginBottom: 16 }}>{kind.missing}</Text>
        <View style={{ flexDirection: 'row' }}>
          <Button title="Add account" onPress={() => router.replace('/account-form')} />
        </View>
      </View>
    );
  }

  // Card choices show what's owed, so you know how much to pay.
  const label = (a: Account) => (a.type === 'credit' ? `${a.name} · ${formatMoney(balance(a, transactions))} owed` : a.name);

  return (
    <ScrollView contentContainerStyle={formStyle} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title }} />

      <Field label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" autoFocus={!existing} />
      <Chips
        label={kind.from}
        options={fromChoices.map((a) => ({ value: a.id, label: label(a) }))}
        value={accountId}
        onChange={setAccountId}
      />
      {canBeTo && (
        <Chips
          label={kind.to ?? 'To'}
          options={toChoices.map((a) => ({ value: a.id, label: label(a) }))}
          value={toAccountId}
          onChange={setToAccountId}
        />
      )}
      {type === 'expense' && (
        <Chips
          label="Category"
          options={categories.map((c) => ({ value: c.name, label: c.name, icon: iconFor(categories, c.name) }))}
          value={category}
          onChange={setCategory}
        />
      )}
      <Field label="Note" value={note} onChangeText={setNote} placeholder="Optional" />

      {/* The date picker library has no web version, so web gets a plain text box. */}
      {Platform.OS === 'web' ? (
        <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder={today()} />
      ) : (
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.muted, marginBottom: 8 }}>Date</Text>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={fromYMD(date)}
              mode="date"
              display="compact"
              onValueChange={(_, d) => setDate(toYMD(d))}
              style={{ alignSelf: 'flex-start' }}
            />
          ) : (
            <>
              <Pressable
                onPress={() => setShowPicker(true)}
                style={{ backgroundColor: colors.lavender, borderRadius: 14, padding: 14, alignSelf: 'flex-start' }}
              >
                <Text style={{ fontWeight: '700', color: colors.text }}><Ionicons name="calendar-outline" size={15} color={colors.primary} /> {shortDate(date)}, {date.slice(0, 4)}</Text>
              </Pressable>
              {showPicker && (
                <DateTimePicker
                  value={fromYMD(date)}
                  mode="date"
                  onValueChange={(_, d) => {
                    setShowPicker(false);
                    setDate(toYMD(d));
                  }}
                  onDismiss={() => setShowPicker(false)}
                />
              )}
            </>
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row' }}>
        <Button title={existing ? 'Save' : kind.button} onPress={save} color={colors[kind.color]} />
      </View>
      {existing && (
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <Button title="Delete" onPress={confirmDelete} color={colors.red} outline />
        </View>
      )}
    </ScrollView>
  );
}
