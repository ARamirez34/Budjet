// List of expense categories. Tap one to edit it.
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Bubble, Button, Card, formStyle } from '@/components/ui';
import { iconFor } from '@/categories';
import { useData } from '@/store';
import { useColors } from '@/theme';

export default function CategoriesScreen() {
  const { categories } = useData();
  const colors = useColors();

  return (
    <ScrollView contentContainerStyle={formStyle}>
      <Card>
        {categories.map((c) => (
          <Pressable
            key={c.name}
            onPress={() => router.push({ pathname: '/category-form', params: { name: c.name } })}
            style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }, pressed && { opacity: 0.6 }]}
          >
            <Bubble color={colors.lavender}>
              <Ionicons name={iconFor(categories, c.name)} size={20} color={colors.primary} />
            </Bubble>
            <Text style={{ flex: 1, fontSize: 16, fontWeight: '700', color: colors.text }}>{c.name}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </Card>
      <View style={{ flexDirection: 'row' }}>
        <Button title="Add category" icon="add-circle" onPress={() => router.push('/category-form')} />
      </View>
    </ScrollView>
  );
}
