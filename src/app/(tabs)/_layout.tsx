import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { useColors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export default function TabsLayout() {
  const colors = useColors();
  const icon = (name: IconName) => ({ focused, size }: { focused: boolean; size: number }) => (
    <Ionicons name={name} color={focused ? colors.primary : colors.muted} size={size} />
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', fontSize: 22 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Budjet',
          tabBarLabel: 'Home',
          tabBarIcon: icon('home-outline'),
          headerRight: () => (
            // hitSlop (not padding) keeps the tap area big without making the button taller than the header.
            <Pressable
              accessibilityLabel="Settings"
              onPress={() => router.push('/settings')}
              hitSlop={12}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen name="accounts" options={{ title: 'Accounts', tabBarIcon: icon('wallet-outline') }} />
      <Tabs.Screen name="bills" options={{ title: 'Bills', tabBarIcon: icon('calendar-outline') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: icon('list-outline') }} />
      <Tabs.Screen name="summary" options={{ title: 'Summary', tabBarIcon: icon('pie-chart-outline') }} />
    </Tabs>
  );
}
