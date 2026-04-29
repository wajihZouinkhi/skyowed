'use client';
import { useState } from 'react';

export default function Track() {
  const [id, setId] = useState('');
  const [claim, setClaim] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setErr(null); setClaim(null);
    const r = await fetch(`/api/claims/${id}`);
    const j = await r.json();
    if (!r.ok) { setErr(j.error ?? 'Not found'); return; }
    setClaim(j.claim);
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Track a claim</h1>
      <p className="text-slate-600 mb-4">Enter the claim ID from your confirmation email.</p>
      <div className="flex gap-2 mb-6">
        <input value={id} onChange={e => setId(e.target.value)} placeholder="claim id"
               className="flex-1 rounded border px-3 py-2" />
        <button onClick={go} className="rounded bg-sky-600 px-4 py-2 text-white">Track</button>
      </div>
      {err && <p className="text-red-600">{err}</p>}
      {claim && (
        <pre className="rounded bg-slate-50 p-4 text-sm overflow-auto">{JSON.stringify(claim, null, 2)}</pre>
      )}
    </main>
  );
}
