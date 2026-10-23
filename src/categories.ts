export const CATEGORIES = [
  { name: 'Food', emoji: '🍔' },
  { name: 'Transport', emoji: '🚌' },
  { name: 'Shopping', emoji: '🛍️' },
  { name: 'Bills', emoji: '💡' },
  { name: 'Fun', emoji: '🎉' },
  { name: 'Other', emoji: '📦' },
];

export const categoryEmoji = (name?: string) => CATEGORIES.find((c) => c.name === name)?.emoji ?? '📦';
