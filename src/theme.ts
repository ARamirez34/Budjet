import { useColorScheme } from 'react-native';

// Soft pastel palette. Each pastel "tint" has a darker partner for text/icons on top of it.
const light = {
  bg: '#FBF8F3', // warm cream
  card: '#FFFFFF',
  text: '#2D2A3E',
  muted: '#8A8699',
  border: '#EEEAF2',
  primary: '#7C6CF2', // soft violet

  lavender: '#ECE7FF',
  mint: '#DDF6E8',
  mintDark: '#2E9E6A',
  peach: '#FFE4DA',
  coral: '#E8664E',
  sky: '#DEEBFF',
  skyDark: '#4A7FD6',

  green: '#3FB97E',
  yellow: '#F2B33D',
  red: '#EF5B5B',
};

export type Colors = typeof light;

// Same names, night version: deep plum background, pastels become soft glows.
const dark: Colors = {
  bg: '#16141D',
  card: '#221F2C',
  text: '#F2F0F7',
  muted: '#A19DB2',
  border: '#332F42',
  primary: '#A498FF',

  lavender: '#2D2843',
  mint: '#1C3529',
  mintDark: '#72D9A3',
  peach: '#3B2723',
  coral: '#FF9580',
  sky: '#1D2B42',
  skyDark: '#8CB8FF',

  green: '#55CC92',
  yellow: '#F5C25A',
  red: '#FF7272',
};

// Follows the phone's light/dark setting, and updates live when it changes.
export const useColors = (): Colors => (useColorScheme() === 'dark' ? dark : light);

export const radius = 20;
