// Every entry, filtered by month and (optionally) one account. Tap an entry to edit or delete it.
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { MonthPicker } from '@/components/MonthPicker';
import { TxRow } from '@/components/TxRow';
import { Card, Chips } from '@/components/ui';
import { monthOf, newestFirst, today } from '@/money';
import { useData } from '@/store';
import { colors } from '@/theme';

const ALL = 'all';

export default function HistoryScreen() {
  const { accounts, transactions } = useData();
  const [month, setMonth] = useState(monthOf(today()));
  const [accountId, setAccountId] = useState(ALL);

  const shown = newestFirst(transactions).filter(
    (t) =>
      monthOf(t.date) === month &&
      (accountId === ALL || t.accountId === accountId || t.toAccountId === accountId),
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <MonthPicker month={month} onChange={setMonth} />
      <Chips
        label="Account"
        options={[{ value: ALL, label: 'All' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
        value={accountId}
        onChange={setAccountId}
      />

      <Card>
        {shown.length === 0 ? (
          <Text style={{ color: colors.muted }}>No entries for this month 🌙</Text>
        ) : (
          shown.map((t) => (
            <TxRow
              key={t.id}
              tx={t}
              accounts={accounts}
              onPress={() => router.push({ pathname: '/transaction-form', params: { id: t.id } })}
            />
          ))
        )}
      </Card>
    </ScrollView>
  );
}
