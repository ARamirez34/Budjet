// Self-check for the balance math. Run with: npm test
import assert from 'node:assert/strict';
import {
  balance, freeToSpend, fromYMD, monthIncome, monthSpending, newestFirst, parseMoney, shiftMonth, spendingByCategory, toYMD, totals,
} from './money.ts';
import type { Account, Transaction } from './types.ts';

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

assert.equal(balance({ ...checking, startingBalance: 0.1 }, [tx({ type: 'income', amount: 0.2 })]), 0.3);
assert.equal(parseMoney('$1,500.50'), 1500.5);
assert.ok(Number.isNaN(parseMoney('abc')));
assert.ok(Number.isNaN(parseMoney('')));

assert.equal(toYMD(fromYMD('2026-03-01')), '2026-03-01');
assert.equal(shiftMonth('2026-01', -1), '2025-12');
assert.equal(shiftMonth('2026-12', 1), '2027-01');
const order = newestFirst([tx({ id: 'a', date: '2026-10-01' }), tx({ id: 'b', date: '2026-10-05' }), tx({ id: 'c', date: '2026-10-05' })]);
assert.deepEqual(order.map((t) => t.id), ['c', 'b', 'a']);

console.log('money.ts: all checks passed');
