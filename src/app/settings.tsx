import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Button, Field, formStyle } from '@/components/ui';
import { parseMoney } from '@/money';
import { useData } from '@/store';
import { colors } from '@/theme';

export default function SettingsScreen() {
  const { settings, saveSettings } = useData();
  const [limit, setLimit] = useState(String(settings.monthlyLimit));
  const [cushion, setCushion] = useState(String(settings.checkingCushion));

  function save() {
    const monthlyLimit = parseMoney(limit);
    const checkingCushion = parseMoney(cushion);
    if (!(monthlyLimit > 0)) return Alert.alert('The limit must be more than $0.');
    if (!(checkingCushion >= 0)) return Alert.alert('The cushion must be $0 or more.');
    saveSettings({ monthlyLimit, checkingCushion });
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={formStyle} keyboardShouldPersistTaps="handled">
      <Field label="Monthly spending limit" value={limit} onChangeText={setLimit} keyboardType="decimal-pad" />
      <Field label="Checking cushion" value={cushion} onChangeText={setCushion} keyboardType="decimal-pad" />
      <Text style={{ color: colors.muted, marginTop: -8, marginBottom: 24 }}>
        Money in checking above this amount is your Budjet: free to spend.
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <Button title="Save" onPress={save} />
      </View>
    </ScrollView>
  );
}
