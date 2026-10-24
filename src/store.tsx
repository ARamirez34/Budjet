// All app data lives here. Screens read it with useData() and change it with the
// functions below. Every change is saved on the device with AsyncStorage (browser storage on web).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { billExpense, nextDue } from './bills';
import { EMPTY, normalize } from './data';
import { today } from './money';
import { useColors } from './theme';
import type { Account, AppData, Bill, Category, Settings, Transaction } from './types';

const STORAGE_KEY = 'budjet-data-v1';

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Add the item, or replace the one with the same id.
function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
}

function useStore() {
  const [data, setData] = useState<AppData>(EMPTY);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Load once when the app starts.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => {
        // normalize() fills in defaults and fixes up data from older versions.
        if (json) setData(normalize(JSON.parse(json)));
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
    // Deleting an account also deletes every transaction and bill that uses it.
    deleteAccount: (id: string) =>
      setData((d) => ({
        ...d,
        accounts: d.accounts.filter((a) => a.id !== id),
        transactions: d.transactions.filter((t) => t.accountId !== id && t.toAccountId !== id),
        bills: d.bills.filter((b) => b.accountId !== id),
      })),
    saveTransaction: (t: Transaction) => setData((d) => ({ ...d, transactions: upsert(d.transactions, t) })),
    deleteTransaction: (id: string) =>
      setData((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) })),

    saveBill: (b: Bill) => setData((d) => ({ ...d, bills: upsert(d.bills, b) })),
    // Deleting a bill also deletes the expenses added from it (they leave Summary, History and balances).
    deleteBill: (id: string) =>
      setData((d) => ({
        ...d,
        bills: d.bills.filter((b) => b.id !== id),
        transactions: d.transactions.filter((t) => t.billId !== id),
      })),
    // "Add expense" on a bill reminder: records the expense and moves the bill on to next month.
    addBillExpense: (bill: Bill) =>
      setData((d) => ({
        ...d,
        bills: upsert(d.bills, { ...bill, paidThrough: nextDue(bill).month }),
        transactions: [...d.transactions, billExpense(bill, today(), newId())],
      })),
    // "Skip": moves the bill on to next month without adding anything.
    skipBill: (bill: Bill) => setData((d) => ({ ...d, bills: upsert(d.bills, { ...bill, paidThrough: nextDue(bill).month }) })),

    // Add a category (oldName undefined) or edit one. Renaming also renames it on past entries and bills.
    saveCategory: (oldName: string | undefined, cat: Category) =>
      setData((d) => {
        const renamed = oldName !== undefined && oldName !== cat.name;
        return {
          ...d,
          categories: oldName ? d.categories.map((c) => (c.name === oldName ? cat : c)) : [...d.categories, cat],
          transactions: renamed
            ? d.transactions.map((t) => (t.category === oldName ? { ...t, category: cat.name } : t))
            : d.transactions,
          bills: renamed ? d.bills.map((b) => (b.category === oldName ? { ...b, category: cat.name } : b)) : d.bills,
        };
      }),
    deleteCategory: (name: string) =>
      setData((d) => ({ ...d, categories: d.categories.filter((c) => c.name !== name) })),

    saveSettings: (settings: Settings) => setData((d) => ({ ...d, settings })),
    // Import a backup: replaces everything (already checked by parseBackup).
    replaceAll: (imported: AppData) => setData(imported),
  };
}

const DataContext = createContext<ReturnType<typeof useStore> | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  const colors = useColors();

  if (store.status !== 'ready') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.bg }}>
        {store.status === 'loading' ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={{ textAlign: 'center', color: colors.text }}>
            Couldn't read your saved data. Restart the app to try again.
          </Text>
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
