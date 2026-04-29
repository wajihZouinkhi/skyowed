import { Preferences } from '@capacitor/preferences';
import { isNative } from './native';

const KEY = 'skyowed_pro';

async function setStorage(key: string, value: string) {
  if (await isNative()) {
    await Preferences.set({ key, value });
  } else {
    localStorage.setItem(key, value);
  }
}

async function getStorage(key: string): Promise<string | null> {
  if (await isNative()) {
    const { value } = await Preferences.get({ key });
    return value;
  }
  return localStorage.getItem(key);
}

export async function isPro(): Promise<boolean> {
  const raw = await getStorage(KEY);
  return raw === '1';
}

export async function setPro(v: boolean): Promise<void> {
  await setStorage(KEY, v ? '1' : '0');
}
