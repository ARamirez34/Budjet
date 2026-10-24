// Self-check for the balance math. Run with: npm test
import assert from 'node:assert/strict';
import {
  balance, freeToSpend, fromYMD, monthExpenses, monthIncome, monthSpending, newestFirst, parseMoney, shiftMonth, spendingByCategory, startingBalanceFor, toYMD, totals,
} from './money.ts';
import { billExpense, dueDate, isComingUp, isDone, nextDue, ordinal } from './bills.ts';
import { normalize, parseBackup, toBackupJson } from './data.ts';
import type { Account, Bill, Transaction } from './types.ts';

const checking: Account = { id: 'chk', name: 'Main Checking', type: 'checking', startingBalance: 1500 };
const savings: Account = { id: 'sav', name: 'Savings', type: 'savings', startingBalance: 1000 };
const card: Account = { id: 'card', name: 'Visa', type: 'credit', startingBalance: 100, creditLimit: 2000 };

const tx = (t: Partial<Transaction>): Transaction =>
  ({ id: Math.random().toString(), note: '', date: '2026-10-05', amount: 0, accountId: 'chk', type: 'expense', ...t });

const txs = [
  tx({ type: 'income', amount: 800, accountId: 'chk' }), // paycheck
  tx({ type: 'expense', amount: 50, accountId: 'chk' }), // groceries by debit
  tx({ type: 'expense', amount: 200, accountId: 'card' }), // shoes on card
  tx({ type: 'transfer', amount: 300, accountId: 'chk', toAccountId: 'sav' }),
  tx({ type: 'cardPayment', amount: 150, accountId: 'chk', toAccountId: 'card' }),
  tx({ type: 'expense', amount: 999, accountId: 'chk', date: '2026-09-30' }), // last month
];

assert.equal(balance(checking, txs), 1500 + 800 - 50 - 300 - 150 - 999);
assert.equal(balance(savings, txs), 1300);
assert.equal(balance(card, txs), 100 + 200 - 150);

// Card payment and transfer are NOT spending; both expenses are.
assert.equal(monthSpending(txs, '2026-10'), 250);
assert.equal(monthSpending(txs, '2026-09'), 999);

// Only checking counts (not savings or cards): 801 in checking - 1500 cushion.
assert.equal(freeToSpend([checking, savings, card], txs, 1500), 801 - 1500);

assert.equal(monthIncome(txs, '2026-10'), 800);
const byCat = spendingByCategory(
  [tx({ amount: 10, category: 'Food' }), tx({ amount: 30, category: 'Fun' }), tx({ amount: 5, category: 'Food' })],
  '2026-10',
);
assert.deepEqual(byCat, [{ name: 'Fun', total: 30 }, { name: 'Food', total: 15 }]);

const t = totals([checking, savings, card], txs);
assert.equal(t.cash, 801 + 1300);
assert.equal(t.debt, 150);
assert.equal(t.net, 2101 - 150);

// Setting checking to $2,000 now: transactions stay, the starting balance adjusts.
const newStart = startingBalanceFor(checking, txs, 2000);
assert.equal(balance({ ...checking, startingBalance: newStart }, txs), 2000);
assert.equal(startingBalanceFor(card, txs, balance(card, txs)), card.startingBalance); // unchanged value = no change

assert.equal(balance({ ...checking, startingBalance: 0.1 }, [tx({ type: 'income', amount: 0.2 })]), 0.3);
assert.equal(parseMoney('$1,500.50'), 1500.5);
assert.ok(Number.isNaN(parseMoney('abc')));
assert.ok(Number.isNaN(parseMoney('')));

assert.equal(toYMD(fromYMD('2026-03-01')), '2026-03-01');
assert.equal(shiftMonth('2026-01', -1), '2025-12');
assert.equal(shiftMonth('2026-12', 1), '2027-01');
const order = newestFirst([tx({ id: 'a', date: '2026-10-01' }), tx({ id: 'b', date: '2026-10-05' }), tx({ id: 'c', date: '2026-10-05' })]);
assert.deepEqual(order.map((t) => t.id), ['c', 'b', 'a']);

// Bills are reminders: nothing happens until you add one. Due date of a 31st bill in Feb is the 28th.
const rent: Bill = { id: 'rent', name: 'Rent', amount: 1000, category: 'Rent', accountId: 'chk', day: 31, paidThrough: '2026-01' };
assert.equal(dueDate(rent, '2026-02'), '2026-02-28');
assert.equal(dueDate({ ...rent, day: 5 }, '2026-02'), '2026-02-05');
assert.deepEqual(nextDue(rent), { month: '2026-02', date: '2026-02-28' });

// Reminder shows from 3 days before the due date.
assert.equal(isComingUp(rent, '2026-02-24'), false);
assert.equal(isComingUp(rent, '2026-02-25'), true);
assert.equal(isComingUp(rent, '2026-03-10'), true); // overdue: still asks
assert.equal(isDone(rent, '2026-02'), false);
assert.equal(isDone({ ...rent, paidThrough: '2026-02' }, '2026-02'), true);

// Added early -> dated today. Added late -> dated the due day.
assert.equal(billExpense(rent, '2026-02-26', 'x').date, '2026-02-26');
assert.equal(billExpense(rent, '2026-03-05', 'x').date, '2026-02-28');

// Once added, bills come out of the account but not the monthly limit.
const rentTx = { ...billExpense(rent, '2026-03-05', 'x'), date: '2026-10-01' };
assert.equal(monthSpending([...txs, rentTx], '2026-10'), 250);
assert.equal(monthExpenses([...txs, rentTx], '2026-10'), 250 + 1000);
assert.equal(balance(checking, [...txs, rentTx]), balance(checking, txs) - 1000);

assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 31].map(ordinal), [
  '1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '23rd', '31st',
]);

// Backups: a round trip gives back the same data; bad files are rejected with a friendly message.
const appData = normalize({ accounts: [checking, card], transactions: txs, bills: [rent] });
assert.deepEqual(parseBackup(toBackupJson(appData)), appData);
assert.throws(() => parseBackup('not json'), /isn't a Budjet backup/);
assert.throws(() => parseBackup('{"hello": 1}'), /isn't a Budjet backup/);
const damaged = JSON.parse(toBackupJson(appData));
damaged.data.transactions[0].amount = 'lots';
assert.throws(() => parseBackup(JSON.stringify(damaged)), /damaged/);

// Loading old data: emoji categories get icons; expenses of deleted bills are dropped.
const old = normalize({
  categories: [{ name: 'Food', emoji: '🍔' } as never, { name: 'Coffee', emoji: '☕' } as never],
  transactions: [tx({ id: 'orphan', billId: 'gone' }), tx({ id: 'kept' })],
});
assert.deepEqual(old.categories.map((c) => c.icon), ['fast-food-outline', 'pricetag-outline']);
assert.deepEqual(old.transactions.map((t) => t.id), ['kept']);
assert.equal(old.settings.checkingCushion, 1500);

console.log('money.ts + bills.ts + data.ts: all checks passed');
