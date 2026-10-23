import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { colors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (name: IconName) => ({ focused, size }: { focused: boolean; size: number }) => (
  <Ionicons name={name} color={focused ? colors.primary : colors.muted} size={size} />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        sceneStyle: { backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg },
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
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: icon('list-outline') }} />
      <Tabs.Screen name="summary" options={{ title: 'Summary', tabBarIcon: icon('pie-chart-outline') }} />
    </Tabs>
  );
}
