import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { AccountRow } from '@/components/AccountRow';
import { Button, Card, SectionTitle } from '@/components/ui';
import { balance } from '@/money';
import { useData } from '@/store';
import { useColors } from '@/theme';
import type { AccountType } from '@/types';

const GROUPS: { type: AccountType; title: string }[] = [
  { type: 'checking', title: 'Checking' },
  { type: 'savings', title: 'Savings' },
  { type: 'credit', title: 'Credit cards' },
];

export default function AccountsScreen() {
  const { accounts, transactions } = useData();
  const colors = useColors();

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {GROUPS.map(({ type, title }) => {
        const list = accounts.filter((a) => a.type === type);
        if (list.length === 0) return null;
        return (
          <Card key={type}>
            <SectionTitle>{title}</SectionTitle>
            {list.map((a) => (
              <AccountRow
                key={a.id}
                account={a}
                balance={balance(a, transactions)}
                onPress={() => router.push({ pathname: '/account-form', params: { id: a.id } })}
              />
            ))}
          </Card>
        );
      })}

      {accounts.length === 0 && (
        <Text style={{ color: colors.muted, marginBottom: 16 }}>You don't have any accounts yet.</Text>
      )}
      <View style={{ flexDirection: 'row' }}>
        <Button title="Add account" icon="add-circle" onPress={() => router.push('/account-form')} />
      </View>
    </ScrollView>
  );
}
