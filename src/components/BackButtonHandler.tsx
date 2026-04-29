'use client';
import { useEffect } from 'react';
import { onBackButton } from '@/lib/native';

export default function BackButtonHandler() {
  useEffect(() => {
    const unsub = onBackButton(() => {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
        return true;
      }
      return false;
    });
    return () => { unsub.then(fn => fn()); };
  }, []);
  return null;
}
