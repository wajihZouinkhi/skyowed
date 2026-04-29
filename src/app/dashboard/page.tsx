'use client';
import { useState, useEffect } from 'react';

type Claim = {
  id: string;
  flight_number: string;
  departure: string;
  arrival: string;
  flight_date: string;
  amount_eur: number;
  basis: string;
  status: string;
  created_at: string;
};

export default function Dashboard() {
  const [email, setEmail] = useState('');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('skyowed.email') : '';
    if (saved) setEmail(saved);
  }, []);

  async function load() {
    if (!email) return;
    setLoading(true); setError(null);
    try {
      localStorage.setItem('skyowed.email', email);
      const r = await fetch(`/api/claims?email=${encodeURIComponent(email)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? 'failed');
      setClaims(j.claims);
    } catch (e) {
      setError((e as Error).message);
    } finally { setLoading(false); }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">My claims</h1>
      <div className="flex gap-2 mb-6">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded border px-3 py-2"
          type="email"
        />
        <button onClick={load} className="rounded bg-sky-600 px-4 py-2 text-white">Load</button>
      </div>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && claims.length === 0 && email && (
        <p className="text-slate-500">No claims yet. Run a check on the home page to create one.</p>
      )}
      <ul className="space-y-3">
        {claims.map(c => (
          <li key={c.id} className="rounded border p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{c.flight_number} · {c.departure} → {c.arrival}</div>
              <div className="text-sm text-slate-500">{c.flight_date} · {c.basis}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">€{c.amount_eur}</div>
              <div className="text-xs uppercase tracking-wide text-slate-500">{c.status}</div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
