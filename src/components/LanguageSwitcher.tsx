'use client';
import { LOCALES, type Locale } from '@/lib/i18n';
import { useEffect, useState } from 'react';

export function LanguageSwitcher() {
  const [loc, setLoc] = useState<Locale>('en');
  useEffect(() => {
    const s = (localStorage.getItem('skyowed.locale') as Locale) || 'en';
    setLoc(s);
  }, []);
  function change(l: Locale) {
    setLoc(l);
    localStorage.setItem('skyowed.locale', l);
    document.documentElement.lang = l;
  }
  return (
    <select
      value={loc}
      onChange={e => change(e.target.value as Locale)}
      aria-label="Language"
      className="rounded border px-2 py-1 text-sm"
    >
      {LOCALES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
    </select>
  );
}
