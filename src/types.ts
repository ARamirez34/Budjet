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
}

export interface Settings {
  monthlyLimit: number;
  checkingCushion: number; // checking money above this is "free to spend"
}
