import { Preferences } from '@capacitor/preferences';
import { isNative } from './native';

const STORAGE_KEY = 'skyowed_claims';

export type LocalClaim = {
  id: string;
  createdAt: string;
  depIata: string;
  arrIata: string;
  flightDate: string;
  eventType: string;
  eligible: boolean;
  amount?: number;
  currency?: string;
  jurisdiction?: string;
};

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

export async function saveLocalClaim(c: LocalClaim): Promise<void> {
  const existing = await getLocalClaims();
  const idx = existing.findIndex(x => x.id === c.id);
  if (idx >= 0) existing[idx] = c;
  else existing.unshift(c);
  await setStorage(STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));
}

export async function getLocalClaims(): Promise<LocalClaim[]> {
  const raw = await getStorage(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function deleteLocalClaim(id: string): Promise<void> {
  const existing = await getLocalClaims();
  await setStorage(STORAGE_KEY, JSON.stringify(existing.filter(c => c.id !== id)));
}
