import type { Ionicons } from '@expo/vector-icons';
import type { Category } from './types';

export type IconName = keyof typeof Ionicons.glyphMap;

// Starting categories. You can add, rename and delete them in Settings.
export const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Food', icon: 'fast-food-outline' },
  { name: 'Transport', icon: 'bus-outline' },
  { name: 'Shopping', icon: 'bag-handle-outline' },
  { name: 'Rent', icon: 'home-outline' },
  { name: 'Bills', icon: 'flash-outline' },
  { name: 'Fun', icon: 'game-controller-outline' },
  { name: 'Other', icon: 'cube-outline' },
];

// Icons to pick from when making or editing a category.
export const CATEGORY_ICONS: IconName[] = [
  'fast-food-outline', 'cafe-outline', 'cart-outline', 'pizza-outline',
  'bus-outline', 'car-outline', 'airplane-outline', 'bicycle-outline',
  'bag-handle-outline', 'shirt-outline', 'gift-outline', 'pricetag-outline',
  'home-outline', 'flash-outline', 'wifi-outline', 'phone-portrait-outline',
  'tv-outline', 'game-controller-outline', 'musical-notes-outline', 'film-outline',
  'fitness-outline', 'medkit-outline', 'school-outline', 'book-outline',
  'paw-outline', 'heart-outline', 'cash-outline', 'cube-outline',
];

// Old entries can point at a deleted category, so fall back to a box.
export const iconFor = (categories: Category[], name?: string): IconName =>
  (categories.find((c) => c.name === name)?.icon ?? 'cube-outline') as IconName;
