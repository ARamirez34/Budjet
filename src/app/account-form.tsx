// Add a new account, or edit/delete an existing one (when an ?id= is passed).
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Button, Chips, Field, formStyle } from '@/components/ui';
import { balance, parseMoney, startingBalanceFor } from '@/money';
import { newId, useData } from '@/store';
import { useColors } from '@/theme';
import type { AccountType } from '@/types';

const TYPES: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit', label: 'Credit card' },
];

export default function AccountForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { accounts, transactions, bills, saveAccount, deleteAccount } = useData();
  const colors = useColors();
  const existing = accounts.find((a) => a.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<AccountType>(existing?.type ?? 'checking');
  // The box shows today's balance. Typing a new number makes that the balance.
  const [current, setCurrent] = useState(existing ? String(balance(existing, transactions)) : '');
  const [limit, setLimit] = useState(existing?.creditLimit ? String(existing.creditLimit) : '');
  const isCard = type === 'credit';

  function save() {
    const wanted = current.trim() === '' ? 0 : parseMoney(current);
    const creditLimit = parseMoney(limit);

    if (!name.trim()) return Alert.alert('Please enter a name.');
    if (!Number.isFinite(wanted)) return Alert.alert('Balance must be a number.');
    if (isCard && !(creditLimit > 0)) return Alert.alert('Credit limit must be more than $0.');

    saveAccount({
      id: existing?.id ?? newId(),
      name: name.trim(),
      type,
      // New account: no transactions yet, so the balance you type is the starting balance.
      startingBalance: existing ? startingBalanceFor(existing, transactions, wanted) : wanted,
      creditLimit: isCard ? creditLimit : undefined,
    });
    router.back();
  }

  function confirmDelete() {
    if (!existing) return;
    const linked = transactions.filter((t) => t.accountId === existing.id || t.toAccountId === existing.id).length;
    const linkedBills = bills.filter((b) => b.accountId === existing.id).length;
    Alert.alert(
      `Delete ${existing.name}?`,
      linked + linkedBills > 0
        ? `This also deletes ${linked} transaction(s) and ${linkedBills} bill(s) linked to it.`
        : undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAccount(existing.id);
            router.back();
          },
        },
      ],
    );
  }

  return (
    <ScrollView contentContainerStyle={formStyle} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: existing ? 'Edit account' : 'New account' }} />

      <Field label="Name" value={name} onChangeText={setName} placeholder="Main Checking" />
      {/* Type is locked after creation: switching e.g. checking -> card would flip the meaning of past transactions. */}
      <Chips label="Type" options={TYPES} value={type} onChange={setType} disabled={!!existing} />
      <Field
        label={isCard ? 'Amount owed now' : 'Current balance'}
        value={current}
        onChangeText={setCurrent}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />
      {isCard && (
        <Field label="Credit limit" value={limit} onChangeText={setLimit} placeholder="2000" keyboardType="decimal-pad" />
      )}
      {existing && (
        <Text style={{ color: colors.muted, marginBottom: 16 }}>
          Change this to match your bank app and Budjet will use the new number. Your past entries stay as they are.
        </Text>
      )}

      <View style={{ flexDirection: 'row' }}>
        <Button title="Save" onPress={save} />
      </View>
      {existing && (
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <Button title="Delete account" onPress={confirmDelete} color={colors.red} outline />
        </View>
      )}
    </ScrollView>
  );
}
