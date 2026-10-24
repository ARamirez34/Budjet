// Saving and opening backup files. Phones and web do this differently.
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

// Phone: write the file, then open the share sheet (Save to Files, Drive, email...).
// Web on a phone: the browser's share sheet (Web Share API). Web on a computer, or no share support: download it.
export async function saveBackupFile(json: string, fileName: string) {
  if (Platform.OS === 'web') {
    // globalThis.File is the browser's File (the File imported above is expo-file-system's).
    const file = new globalThis.File([json], fileName, { type: 'application/json' });
    const isPhone = matchMedia('(pointer: coarse)').matches; // touch screen, e.g. iPhone Safari
    if (isPhone && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Budjet backup' });
        return;
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return; // you closed the share sheet
        // any other share error: fall through to a normal download
      }
    }
    const url = URL.createObjectURL(file);
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
