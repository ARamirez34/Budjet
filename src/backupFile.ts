// Saving and opening backup files. Phones and web do this differently.
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

// Phone: write the file, then open the share sheet (Save to Files, Drive, email...). Web: download it.
export async function saveBackupFile(json: string, fileName: string) {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete(); // replace today's earlier export
  file.create();
  await file.write(json);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Save your Budjet backup' });
}

// Lets you pick a file and returns its text, or null if you cancel.
export async function openBackupFile(): Promise<string | null> {
  // Any file type: some phones don't label .json files as JSON. parseBackup checks the contents.
  const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return Platform.OS === 'web' && asset.file ? asset.file.text() : new File(asset.uri).text();
}
