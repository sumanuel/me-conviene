import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@mc_prefs_v2";

/** Preferencias del usuario (modo, fuente de tasa, extras). Nunca lanza. */
export async function loadPrefs() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function savePrefs(prefs) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {}
}
