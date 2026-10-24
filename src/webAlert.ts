// react-native-web's Alert.alert does nothing, so on web use the browser's alert/confirm instead.
// shortcut: confirm() only has OK/Cancel, so OK runs the last non-cancel button; fine while every
// dialog has at most Cancel + one action. Upgrade to a custom modal if a dialog ever needs more.
import { Alert, Platform, type AlertButton } from 'react-native';

if (Platform.OS === 'web') {
  Alert.alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    const text = [title, message].filter(Boolean).join('\n\n');
    const actions = (buttons ?? []).filter((b) => b.style !== 'cancel');
    if (actions.length === 0) return window.alert(text);
    if (window.confirm(text)) actions[actions.length - 1].onPress?.();
  };
}
