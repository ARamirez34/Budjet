// Add a new account, or edit/delete an existing one (when an ?id= is passed).
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Button, Chips, Field, formStyle } from '@/components/ui';
import { parseMoney } from '@/money';
import { newId, useData } from '@/store';
import { colors } from '@/theme';
import type { AccountType } from '@/types';

const TYPES: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit', label: 'Credit card' },
];

export default function AccountForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { accounts, transactions, saveAccount, deleteAccount } = useData();
  const existing = accounts.find((a) => a.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<AccountType>(existing?.type ?? 'checking');
  const [start, setStart] = useState(existing ? String(existing.startingBalance) : '');
  const [limit, setLimit] = useState(existing?.creditLimit ? String(existing.creditLimit) : '');
  const isCard = type === 'credit';

  function save() {
    const startingBalance = start.trim() === '' ? 0 : parseMoney(start);
    const creditLimit = parseMoney(limit);

    if (!name.trim()) return Alert.alert('Please enter a name.');
    if (!Number.isFinite(startingBalance)) return Alert.alert('Starting balance must be a number.');
    if (isCard && !(creditLimit > 0)) return Alert.alert('Credit limit must be more than $0.');

    saveAccount({
      id: existing?.id ?? newId(),
      name: name.trim(),
      type,
      startingBalance,
      creditLimit: isCard ? creditLimit : undefined,
    });
    router.back();
  }

  function confirmDelete() {
    if (!existing) return;
    const linked = transactions.filter((t) => t.accountId === existing.id || t.toAccountId === existing.id).length;
    Alert.alert(
      `Delete ${existing.name}?`,
      linked > 0 ? `This also deletes ${linked} transaction(s) linked to it.` : undefined,
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
        label={isCard ? 'Amount owed at start' : 'Starting balance'}
        value={start}
        onChangeText={setStart}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />
      {isCard && (
        <Field label="Credit limit" value={limit} onChangeText={setLimit} placeholder="2000" keyboardType="decimal-pad" />
      )}
      {existing && (
        <Text style={{ color: colors.muted, marginBottom: 16 }}>
          The starting balance is the amount before any transactions you've entered. The current balance is calculated from it.
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
