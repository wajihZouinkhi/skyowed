'use client';
import { useEffect, useState } from 'react';
import { isNative, openExternal } from '@/lib/native';
import Link from 'next/link';

export default function UpgradePage() {
  const [native, setNative] = useState(false);

  useEffect(() => {
    isNative().then(setNative);
  }, []);

  if (native) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Upgrade Pro</h1>
        <p className="mt-4 text-white/70">Pro upgrades are coming soon in the app. For now, visit skyowed.app on the web to upgrade.</p>
        <button
          onClick={() => openExternal('https://skyowed.app/upgrade')}
          className="btn-primary mt-8 inline-block"
        >
          Open on web
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">Upgrade to Pro</h1>
      <p className="mt-4 text-white/70">Unlock PDF claim letters, claim tracking, and priority support.</p>
      <p className="mt-6 text-sm text-white/40">Stripe checkout coming soon.</p>
      <Link href="/" className="btn-primary mt-8 inline-block">Back home</Link>
    </main>
  );
}
