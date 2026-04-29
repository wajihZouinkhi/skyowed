'use client';
import { useEffect, useState } from 'react';
import { getLocalClaims, deleteLocalClaim, type LocalClaim } from '@/lib/localClaims';
import Link from 'next/link';

export default function HistoryPage() {
  const [claims, setClaims] = useState<LocalClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getLocalClaims();
      setClaims(data);
      setLoading(false);
    })();
  }, []);

  async function remove(id: string) {
    await deleteLocalClaim(id);
    setClaims(await getLocalClaims());
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mx-auto" />
      </main>
    );
  }

  if (claims.length === 0) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">No checks yet</h1>
        <p className="mt-4 text-white/70">Try your first flight eligibility check.</p>
        <Link href="/" className="btn-primary mt-8 inline-block">Check a flight</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">History</h1>
      <div className="space-y-4">
        {claims.map((c) => (
          <div key={c.id} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.depIata} → {c.arrIata}</div>
                <div className="text-sm text-white/50">{c.flightDate} · {c.eventType}</div>
              </div>
              <div className="text-right">
                {c.eligible ? (
                  <div className="font-bold text-emerald-300">{c.currency === 'EUR' ? '€' : '£'}{c.amount}</div>
                ) : (
                  <div className="text-white/40">Not eligible</div>
                )}
                <div className="text-xs text-white/40">{c.jurisdiction || '—'}</div>
              </div>
            </div>
            <button
              onClick={() => remove(c.id)}
              className="mt-3 text-sm text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
