'use client';
import { useEffect, useState } from 'react';
import { isPro, setPro } from '@/lib/pro';

const ALLOWED = process.env.NEXT_PUBLIC_ALLOW_DEV_PRO === '1';

export default function DevProPage() {
  const [pro, setProState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    isPro().then((v) => { setProState(v); setReady(true); });
  }, []);

  if (!ALLOWED) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Not available</h1>
        <p className="mt-4 text-white/60">Set NEXT_PUBLIC_ALLOW_DEV_PRO=1 to enable this page.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">Dev: Pro Toggle</h1>
      <p className="mt-4 text-white/60">Current: {ready ? (pro ? 'PRO = true' : 'PRO = false') : 'Loading…'}</p>
      <div className="mt-8 flex flex-col gap-4">
        <button
          onClick={async () => { await setPro(true); setProState(true); }}
          className="btn-primary w-full"
        >
          Set Pro = true
        </button>
        <button
          onClick={async () => { await setPro(false); setProState(false); }}
          className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 font-semibold text-white hover:bg-white/[0.06]"
        >
          Set Pro = false
        </button>
      </div>
    </main>
  );
}
