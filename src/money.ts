// Pure money math: no React, no storage. Easy to read and to test.
import type { Account, Transaction } from './types.ts';

// Current balance = starting balance + the effect of every transaction.
// For a credit card, "balance" means how much you owe.
export function balance(account: Account, txs: Transaction[]): number {
  const isCard = account.type === 'credit';
  let total = account.startingBalance;

  for (const t of txs) {
    if (t.accountId === account.id) {
      if (t.type === 'income') total += t.amount;
      if (t.type === 'expense') total += isCard ? t.amount : -t.amount; // card: owe more
      if (t.type === 'transfer' || t.type === 'cardPayment') total -= t.amount; // money leaves
    }
    if (t.toAccountId === account.id) {
      if (t.type === 'transfer') total += t.amount; // money arrives
      if (t.type === 'cardPayment') total -= t.amount; // card: owe less
    }
  }
  // Round to cents so 0.1 + 0.2 shows as 0.30, not 0.30000000000000004.
  return Math.round(total * 100) / 100;
}

// Editing an account's balance: find the starting balance that makes today's balance
// come out to `wanted`, so past transactions stay as they are.
export function startingBalanceFor(account: Account, txs: Transaction[], wanted: number): number {
  const fromTransactions = balance(account, txs) - account.startingBalance;
  return Math.round((wanted - fromTransactions) * 100) / 100;
}

export function totals(accounts: Account[], txs: Transaction[]) {
  let cash = 0;
  let debt = 0;
  for (const a of accounts) {
    if (a.type === 'credit') debt += balance(a, txs);
    else cash += balance(a, txs);
  }
  return { cash, debt, net: cash - debt };
}

// Your "Budjet": checking money above the cushion you keep for yourself.
export function freeToSpend(accounts: Account[], txs: Transaction[], cushion: number): number {
  const checking = accounts.filter((a) => a.type === 'checking').reduce((sum, a) => sum + balance(a, txs), 0);
  return checking - cushion;
}

// "2026-10-23" -> "2026-10"
export const monthOf = (date: string) => date.slice(0, 7);

// A Date as "YYYY-MM-DD" in the phone's local time zone.
export function toYMD(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export const today = () => toYMD(new Date());

// "2026-10-23" -> a Date at local midnight (new Date("2026-10-23") would use UTC and can show the wrong day).
export function fromYMD(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// "2026-10-23" -> "Oct 23"
export function shortDate(ymd: string): string {
  return fromYMD(ymd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// "2026-10" moved by n months: shiftMonth("2026-01", -1) -> "2025-12"
export function shiftMonth(month: string, n: number): string {
  return toYMD(new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + n, 1)).slice(0, 7);
}

// "2026-10" -> "October 2026"
export function monthName(month: string): string {
  return fromYMD(`${month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Newest first. Same-day entries: the one added last comes first.
export const newestFirst = (txs: Transaction[]) =>
  [...txs].reverse().sort((a, b) => b.date.localeCompare(a.date));

// All expenses in a month (used by Summary).
export function monthExpenses(txs: Transaction[], month: string): number {
  return txs
    .filter((t) => t.type === 'expense' && monthOf(t.date) === month)
    .reduce((sum, t) => sum + t.amount, 0);
}

// What counts toward the monthly limit: every expense, by checking or by card,
// except bills. Fixed costs like rent would blow a $300 limit on day one.
export function monthSpending(txs: Transaction[], month: string): number {
  return monthExpenses(txs.filter((t) => !t.billId), month);
}

export function monthIncome(txs: Transaction[], month: string): number {
  return txs
    .filter((t) => t.type === 'income' && monthOf(t.date) === month)
    .reduce((sum, t) => sum + t.amount, 0);
}

// [{ name: 'Food', total: 120 }, ...] biggest first, only categories with spending.
export function spendingByCategory(txs: Transaction[], month: string) {
  const totals: Record<string, number> = {};
  for (const t of txs) {
    if (t.type === 'expense' && monthOf(t.date) === month) {
      const name = t.category ?? 'Other';
      totals[name] = (totals[name] ?? 0) + t.amount;
    }
  }
  return Object.entries(totals)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

export function formatMoney(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// Turns what the user typed ("$1,500.50") into a number, or NaN if it isn't one.
export function parseMoney(text: string): number {
  const cleaned = text.replace(/[$,\s]/g, '');
  return cleaned === '' ? NaN : Number(cleaned);
}
