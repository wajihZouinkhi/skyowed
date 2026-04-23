'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';
type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };

const ThemeCtx = createContext<Ctx | null>(null);
const KEY = 'skyowed.theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem(KEY)) as Theme | null;
    const prefersLight = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial: Theme = saved || (prefersLight ? 'light' : 'dark');
    setThemeState(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(KEY, t); } catch {}
  };

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

type Prefs = { lastDepart?: string; lastArrive?: string; lastReason?: string };
const PKEY = 'skyowed.prefs';
export const prefsStore = {
  load(): Prefs {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(PKEY) || '{}'); } catch { return {}; }
  },
  save(p: Prefs) {
    if (typeof window === 'undefined') return;
    const cur = prefsStore.load();
    try { localStorage.setItem(PKEY, JSON.stringify({ ...cur, ...p })); } catch {}
  },
};
