// Pure bill logic. Bills are reminders: they never change any balance on their own.
// Only when you tap "Add expense" does a bill become a real expense.
import { fromYMD, shiftMonth, toYMD } from './money.ts';
import type { Bill, Transaction } from './types.ts';

const REMIND_DAYS_BEFORE = 3;

// The bill's due date in a given month. A bill on the 31st is due Feb 28 in February.
export function dueDate(bill: Pick<Bill, 'day'>, month: string): string {
  const [y, m] = month.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate(); // day 0 of next month = last day of this one
  return `${month}-${String(Math.min(bill.day, lastDay)).padStart(2, '0')}`;
}

// Done = this month's bill was added as an expense or skipped.
export const isDone = (bill: Bill, month: string) => bill.paidThrough >= month;

// The next month you haven't handled yet, and its due date.
export function nextDue(bill: Bill) {
  const month = shiftMonth(bill.paidThrough, 1);
  return { month, date: dueDate(bill, month) };
}

// Show the "coming up" reminder from a few days before the due date (and after, until handled).
export function isComingUp(bill: Bill, today: string): boolean {
  const remindFrom = fromYMD(nextDue(bill).date);
  remindFrom.setDate(remindFrom.getDate() - REMIND_DAYS_BEFORE);
  return toYMD(remindFrom) <= today;
}

// The expense to add when you tap "Add expense". Dated the due day if that's already passed, else today.
export function billExpense(bill: Bill, today: string, id: string): Transaction {
  const { date } = nextDue(bill);
  return {
    id,
    type: 'expense',
    amount: bill.amount,
    category: bill.category,
    accountId: bill.accountId,
    note: bill.name,
    date: date < today ? date : today,
    billId: bill.id,
  };
}

// 1 -> "1st", 2 -> "2nd", 11 -> "11th", 23 -> "23rd"
export function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  return n + (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
}
