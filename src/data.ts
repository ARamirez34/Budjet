// Turning saved or imported data into a clean AppData, and backup files in and out.
// Pure functions (no React, no storage) so they can be tested with `npm test`.
import { DEFAULT_CATEGORIES } from './categories.ts';
import type { AppData, Category, Transaction } from './types.ts';

const DEFAULT_SETTINGS = { monthlyLimit: 300, checkingCushion: 1500 };

// Fill in defaults and fix up data written by older versions of the app.
export function normalize(saved: Partial<AppData>): AppData {
  const bills = saved.bills ?? [];
  return {
    accounts: saved.accounts ?? [],
    bills,
    settings: { ...DEFAULT_SETTINGS, ...saved.settings },
    // Categories used to have emojis; give them icons (matching default, or a tag).
    categories: (saved.categories ?? DEFAULT_CATEGORIES).map((c: Category) =>
      c.icon ? c : { name: c.name, icon: DEFAULT_CATEGORIES.find((d) => d.name === c.name)?.icon ?? 'pricetag-outline' },
    ),
    // Older versions kept a bill's expenses after the bill was deleted. Deleting a bill now deletes them.
    transactions: (saved.transactions ?? []).filter(
      (t: Transaction) => !t.billId || bills.some((b) => b.id === t.billId),
    ),
  };
}

export const EMPTY: AppData = normalize({});

export function toBackupJson(data: AppData): string {
  return JSON.stringify({ app: 'budjet', version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
}

// Backup files come from outside the app, so check everything before trusting it.
const isDate = (s: unknown) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isNum = (n: unknown) => typeof n === 'number' && Number.isFinite(n);
const isStr = (s: unknown) => typeof s === 'string';

/* eslint-disable @typescript-eslint/no-explicit-any */
const isAccount = (a: any) =>
  isStr(a?.id) && isStr(a.name) && ['checking', 'savings', 'credit'].includes(a.type) && isNum(a.startingBalance);
const isTransaction = (t: any) =>
  isStr(t?.id) &&
  ['income', 'expense', 'transfer', 'cardPayment'].includes(t.type) &&
  isNum(t.amount) &&
  isDate(t.date) &&
  isStr(t.accountId);
const isBill = (b: any) =>
  isStr(b?.id) && isStr(b.name) && isNum(b.amount) && Number.isInteger(b.day) && isStr(b.accountId) &&
  /^\d{4}-\d{2}$/.test(b.paidThrough);
const isCategory = (c: any) => isStr(c?.name);
const listOf = (value: unknown, check: (x: any) => boolean, optional = false) =>
  (optional && value === undefined) || (Array.isArray(value) && value.every(check));

// Throws an Error with a friendly message if the file isn't a valid Budjet backup.
export function parseBackup(text: string): AppData {
  let file: any;
  try {
    file = JSON.parse(text);
  } catch {
    throw new Error("That file isn't a Budjet backup.");
  }
  const d = file?.app === 'budjet' ? file.data : undefined;
  if (!d) throw new Error("That file isn't a Budjet backup.");

  const settingsOk =
    d.settings === undefined ||
    [d.settings.monthlyLimit, d.settings.checkingCushion].every((v) => v === undefined || isNum(v));
  const ok =
    listOf(d.accounts, isAccount) &&
    listOf(d.transactions, isTransaction) &&
    listOf(d.bills, isBill, true) &&
    listOf(d.categories, isCategory, true) &&
    settingsOk;
  if (!ok) throw new Error('This backup looks damaged, so nothing was changed.');
  return normalize(d);
}
