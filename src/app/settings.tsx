import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Button, Field, formStyle } from '@/components/ui';
import { openBackupFile, saveBackupFile } from '@/backupFile';
import { parseBackup, toBackupJson } from '@/data';
import { parseMoney, today } from '@/money';
import { useData } from '@/store';
import { useColors } from '@/theme';

export default function SettingsScreen() {
  const { accounts, transactions, bills, categories, settings, saveSettings, replaceAll } = useData();
  const colors = useColors();
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

  async function exportBackup() {
    try {
      const json = toBackupJson({ accounts, transactions, bills, categories, settings });
      await saveBackupFile(json, `budjet-backup-${today()}.json`);
    } catch (e) {
      Alert.alert("Couldn't export", String(e));
    }
  }

  async function importBackup() {
    let backup;
    try {
      const text = await openBackupFile();
      if (text === null) return; // picked nothing
      backup = parseBackup(text);
    } catch (e) {
      return Alert.alert("Couldn't import", e instanceof Error ? e.message : String(e));
    }
    const imported = backup;
    Alert.alert(
      'Replace all your data?',
      `This backup has ${imported.accounts.length} account(s) and ${imported.transactions.length} entries. ` +
        'Everything currently in the app will be replaced. Export first if you want to keep it.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace', style: 'destructive', onPress: () => (replaceAll(imported), router.back()) },
      ],
    );
  }

  return (
    <ScrollView contentContainerStyle={formStyle} keyboardShouldPersistTaps="handled">
      <Field label="Monthly spending limit" value={limit} onChangeText={setLimit} keyboardType="decimal-pad" />
      <Text style={{ color: colors.muted, marginTop: -8, marginBottom: 18 }}>Bills don't count toward this limit.</Text>
      <Field label="Checking cushion" value={cushion} onChangeText={setCushion} keyboardType="decimal-pad" />
      <Text style={{ color: colors.muted, marginTop: -8, marginBottom: 24 }}>
        Money in checking above this amount is your Budjet: free to spend.
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <Button title="Save" onPress={save} />
      </View>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <Button title="Edit categories" icon="pricetags-outline" onPress={() => router.push('/categories')} color={colors.primary} outline />
      </View>

      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 32, marginBottom: 6 }}>Backup</Text>
      <Text style={{ color: colors.muted, marginBottom: 14 }}>
        Your data only lives on this device. Export a backup file now and then, and keep it somewhere safe.
      </Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button title="Export" icon="download-outline" onPress={exportBackup} color={colors.mint} textColor={colors.mintDark} />
        <Button title="Import" icon="push-outline" onPress={importBackup} color={colors.lavender} textColor={colors.primary} />
      </View>
    </ScrollView>
  );
}
