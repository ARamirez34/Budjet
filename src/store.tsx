// All app data lives here. Screens read it with useData() and change it with the
// functions below. Every change is saved to the phone with AsyncStorage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { Account, Settings, Transaction } from './types';

interface Data {
  accounts: Account[];
  transactions: Transaction[];
  settings: Settings;
}

const STORAGE_KEY = 'budjet-data-v1';
const EMPTY: Data = { accounts: [], transactions: [], settings: { monthlyLimit: 300, checkingCushion: 1500 } };

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Add the item, or replace the one with the same id.
function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
}

function useStore() {
  const [data, setData] = useState<Data>(EMPTY);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Load once when the app starts.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => {
        if (json) {
          const saved = JSON.parse(json);
          // Fill in defaults for settings added after the data was first saved.
          setData({ ...EMPTY, ...saved, settings: { ...EMPTY.settings, ...saved.settings } });
        }
        setStatus('ready');
      })
      .catch(() => setStatus('error')); // never save over data we couldn't read
  }, []);

  // Save after every change.
  useEffect(() => {
    if (status === 'ready') AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(console.warn);
  }, [data, status]);

  return {
    ...data,
    status,
    saveAccount: (a: Account) => setData((d) => ({ ...d, accounts: upsert(d.accounts, a) })),
    // Deleting an account also deletes every transaction that touches it.
    deleteAccount: (id: string) =>
      setData((d) => ({
        ...d,
        accounts: d.accounts.filter((a) => a.id !== id),
        transactions: d.transactions.filter((t) => t.accountId !== id && t.toAccountId !== id),
      })),
    saveTransaction: (t: Transaction) => setData((d) => ({ ...d, transactions: upsert(d.transactions, t) })),
    deleteTransaction: (id: string) =>
      setData((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) })),
    saveSettings: (settings: Settings) => setData((d) => ({ ...d, settings })),
  };
}

const DataContext = createContext<ReturnType<typeof useStore> | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const store = useStore();

  if (store.status !== 'ready') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {store.status === 'loading' ? (
          <ActivityIndicator />
        ) : (
          <Text style={{ textAlign: 'center' }}>Couldn't read your saved data. Restart the app to try again.</Text>
        )}
      </View>
    );
  }
  return <DataContext.Provider value={store}>{children}</DataContext.Provider>;
}

export function useData() {
  const store = useContext(DataContext);
  if (!store) throw new Error('useData must be used inside <DataProvider>');
  return store;
}
