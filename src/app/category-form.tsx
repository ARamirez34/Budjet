// Add a category, or edit/delete one (when a ?name= is passed).
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Field, formStyle } from '@/components/ui';
import { CATEGORY_ICONS } from '@/categories';
import { useData } from '@/store';
import { useColors } from '@/theme';

export default function CategoryForm() {
  const params = useLocalSearchParams<{ name?: string }>();
  const { categories, saveCategory, deleteCategory } = useData();
  const colors = useColors();
  const existing = categories.find((c) => c.name === params.name);

  const [icon, setIcon] = useState(existing?.icon ?? 'pricetag-outline');
  const [name, setName] = useState(existing?.name ?? '');

  function save() {
    const clean = name.trim();
    if (!clean) return Alert.alert('Please enter a name.');
    const taken = categories.some((c) => c.name.toLowerCase() === clean.toLowerCase() && c !== existing);
    if (taken) return Alert.alert(`You already have a "${clean}" category.`);

    saveCategory(existing?.name, { name: clean, icon });
    router.back();
  }

  function confirmDelete() {
    if (!existing) return;
    if (categories.length === 1) return Alert.alert('You need at least one category.');
    Alert.alert(`Delete ${existing.name}?`, 'Past entries keep this name.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => (deleteCategory(existing.name), router.back()) },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={formStyle} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: existing ? 'Edit category' : 'New category' }} />

      <Field label="Name" value={name} onChangeText={setName} placeholder="Coffee" />

      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.muted, marginBottom: 8 }}>Icon</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        {CATEGORY_ICONS.map((i) => {
          const selected = i === icon;
          return (
            <Pressable
              key={i}
              accessibilityRole="radio"
              accessibilityLabel={i.replace('-outline', '').replace(/-/g, ' ')}
              accessibilityState={{ selected }}
              onPress={() => setIcon(i)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? colors.primary : colors.lavender,
              }}
            >
              <Ionicons name={i} size={22} color={selected ? '#fff' : colors.primary} />
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row' }}>
        <Button title="Save" onPress={save} />
      </View>
      {existing && (
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <Button title="Delete category" onPress={confirmDelete} color={colors.red} outline />
        </View>
      )}
    </ScrollView>
  );
}
