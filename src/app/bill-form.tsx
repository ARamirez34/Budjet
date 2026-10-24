// Add a monthly bill reminder, or edit/delete one (when an ?id= is passed).
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Button, Chips, Field, formStyle } from '@/components/ui';
import { iconFor } from '@/categories';
import { monthOf, parseMoney, shiftMonth, today } from '@/money';
import { newId, useData } from '@/store';
import { useColors } from '@/theme';

export default function BillForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { bills, accounts, categories, transactions, saveBill, deleteBill } = useData();
  const colors = useColors();
  const existing = bills.find((b) => b.id === id);

  // Same rule as expenses: paid from checking or a credit card.
  const choices = accounts.filter((a) => a.type !== 'savings');

  const [name, setName] = useState(existing?.name ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [accountId, setAccountId] = useState(existing?.accountId ?? choices[0]?.id);
  const [category, setCategory] = useState(
    existing?.category ?? categories.find((c) => c.name === 'Bills')?.name ?? categories[0]?.name ?? 'Other',
  );
  const [day, setDay] = useState(existing ? String(existing.day) : '1');

  function save() {
    const value = parseMoney(amount);
    const dayNum = Number(day);
    if (!name.trim()) return Alert.alert('Please enter a name.');
    if (!(value > 0)) return Alert.alert('Please enter an amount above $0.');
    if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 31) return Alert.alert('Due day must be 1 to 31.');
    if (!accountId) return Alert.alert('Please choose an account.');

    saveBill({
      id: existing?.id ?? newId(),
      name: name.trim(),
      amount: value,
      category,
      accountId,
      day: dayNum,
      // New bill starts with this month. If its day already passed, Home just asks you (you can Skip).
      paidThrough: existing?.paidThrough ?? shiftMonth(monthOf(today()), -1),
    });
    router.back();
  }

  function confirmDelete() {
    if (!existing) return;
    const added = transactions.filter((t) => t.billId === existing.id).length;
    Alert.alert(
      `Delete ${existing.name}?`,
      added > 0
        ? `Its ${added} expense(s) will be deleted too. They'll disappear from History and Summary, and the money goes back to the account.`
        : undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => (deleteBill(existing.id), router.back()) },
      ],
    );
  }

  if (choices.length === 0) {
    return (
      <View style={formStyle}>
        <Text style={{ color: colors.muted, marginBottom: 16 }}>Add a checking account or credit card first.</Text>
        <View style={{ flexDirection: 'row' }}>
          <Button title="Add account" onPress={() => router.replace('/account-form')} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={formStyle} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: existing ? 'Edit bill' : 'New bill' }} />

      <Field label="Name" value={name} onChangeText={setName} placeholder="Rent" />
      <Field label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />
      <Field label="Due day of the month (1–31)" value={day} onChangeText={setDay} keyboardType="number-pad" />
      <Chips
        label="Paid with"
        options={choices.map((a) => ({ value: a.id, label: a.name }))}
        value={accountId}
        onChange={setAccountId}
      />
      <Chips
        label="Category"
        options={categories.map((c) => ({ value: c.name, label: c.name, icon: iconFor(categories, c.name) }))}
        value={category}
        onChange={setCategory}
      />
      <Text style={{ color: colors.muted, marginBottom: 18 }}>
        A bill is just a reminder. A few days before it's due, Home asks if you want to add it as an expense.
      </Text>

      <View style={{ flexDirection: 'row' }}>
        <Button title="Save" onPress={save} />
      </View>
      {existing && (
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <Button title="Delete bill" onPress={confirmDelete} color={colors.red} outline />
        </View>
      )}
    </ScrollView>
  );
}
