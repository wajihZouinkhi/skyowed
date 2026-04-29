'use client';
import { useEffect } from 'react';
import { useTheme } from '@/lib/store';
import { applyStatusBarTheme, hideSplash, isNative } from '@/lib/native';

export default function NativeBridge() {
  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      if (await isNative()) {
        await applyStatusBarTheme(theme);
        setTimeout(() => { hideSplash(); }, 1200);
      }
    })();
  }, []);

  useEffect(() => {
    applyStatusBarTheme(theme);
  }, [theme]);

  return null;
}
