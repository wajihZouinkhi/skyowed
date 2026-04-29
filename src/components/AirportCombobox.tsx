'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AIRPORTS, type Airport } from '@/lib/airports';

type Props = {
  label: string;
  value: string;
  onChange: (iata: string) => void;
  placeholder?: string;
};

const AIRPORT_LIST: Airport[] = Object.values(AIRPORTS);

export default function AirportCombobox({ label, value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const selected = useMemo<Airport | undefined>(
    () => AIRPORT_LIST.find((a) => a.iata === value),
    [value]
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AIRPORT_LIST.slice(0, 8);
    return AIRPORT_LIST.filter(
      (a) =>
        a.iata.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  function pick(a: Airport) {
    onChange(a.iata);
    setQuery('');
    setOpen(false);
  }

  const displayValue = open
    ? query
    : selected
    ? `${selected.iata} · ${selected.name}`
    : value;

  return (
    <div ref={ref} className="relative">
      <label className="label">{label}</label>
      <input
        className="field"
        value={displayValue}
        placeholder={placeholder || 'Search city or IATA'}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        onFocus={() => { setOpen(true); setQuery(''); }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(0); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, results.length - 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
          else if (e.key === 'Enter') { e.preventDefault(); if (results[highlight]) pick(results[highlight]); }
          else if (e.key === 'Escape') setOpen(false);
        }}
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-auto rounded-xl border border-white/10 bg-[#0b0d14]/95 p-1 shadow-2xl backdrop-blur-xl">
          {results.map((a, i) => (
            <button
              key={a.iata}
              type="button"
              onMouseEnter={() => setHighlight(i)}
              onClick={() => pick(a)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                i === highlight ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{a.name}</div>
                <div className="truncate text-xs text-white/50">{a.country}</div>
              </div>
              <span className="chip shrink-0 font-mono">{a.iata}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
