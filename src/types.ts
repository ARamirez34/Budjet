export type AccountType = 'checking' | 'savings' | 'credit';

export interface Account {
  id: string;
  name: string; // "Main Checking"
  type: AccountType;
  startingBalance: number; // for credit cards: amount owed at the start
  creditLimit?: number; // credit cards only
}

export type TxType = 'income' | 'expense' | 'transfer' | 'cardPayment';

export interface Transaction {
  id: string;
  type: TxType;
  amount: number; // always positive
  date: string; // "2026-10-23"
  note: string;
  category?: string; // expenses only
  accountId: string; // income: into · expense: paid with · transfer/payment: from
  toAccountId?: string; // transfer: to · cardPayment: the card
  billId?: string; // set when a bill created this expense
}

export interface Category {
  name: string; // also what transactions store, so renaming updates them
  icon: string; // an Ionicons name, e.g. "fast-food-outline"
}

// A monthly bill (rent, phone, Netflix...). Just a reminder: it changes nothing until you add it as an expense.
export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  accountId: string; // paid with (checking or credit card)
  day: number; // day of the month it's due, 1–31 (31 means "last day" in shorter months)
  paidThrough: string; // last month you added or skipped, "2026-10"
}

// Everything the app saves. Also the shape of a backup file's "data".
export interface AppData {
  accounts: Account[];
  transactions: Transaction[];
  bills: Bill[];
  categories: Category[];
  settings: Settings;
}

export interface Settings {
  monthlyLimit: number;
  checkingCushion: number; // checking money above this is "free to spend"
}
