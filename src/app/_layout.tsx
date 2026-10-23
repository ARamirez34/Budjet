import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DataProvider } from '@/store';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <DataProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.bg },
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '800' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="account-form" options={{ presentation: 'modal', title: 'Account' }} />
        <Stack.Screen name="transaction-form" options={{ presentation: 'modal', title: 'Entry' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', title: 'Settings' }} />
      </Stack>
    </DataProvider>
  );
}
