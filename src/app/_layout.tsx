import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from '@/store';
import '@/webAlert';
import { useColors } from '@/theme';

export default function RootLayout() {
  const colors = useColors();
  const modal = (title: string) => ({ presentation: 'modal' as const, title });

  return (
    // Expo Router gives web zero safe areas; this provider reads the real ones (iPhone home bar, notch).
    <SafeAreaProvider>
      <DataProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.bg },
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '800' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="account-form" options={modal('Account')} />
          <Stack.Screen name="transaction-form" options={modal('Entry')} />
          <Stack.Screen name="bill-form" options={modal('Bill')} />
          <Stack.Screen name="settings" options={modal('Settings')} />
          <Stack.Screen name="categories" options={modal('Categories')} />
          <Stack.Screen name="category-form" options={modal('Category')} />
        </Stack>
      </DataProvider>
    </SafeAreaProvider>
  );
}
