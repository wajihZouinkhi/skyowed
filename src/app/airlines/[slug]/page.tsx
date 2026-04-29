import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AIRLINES } from '@/lib/airlines';

const SLUG_MAP: Record<string, string> = {
  ryanair: 'FR',
  easyjet: 'U2',
  lufthansa: 'LH',
};

const SLUGS = Object.keys(SLUG_MAP);

export function generateStaticParams() {
  return SLUGS.map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const iata = SLUG_MAP[params.slug];
  const airline = iata ? AIRLINES.find(a => a.iata === iata) : undefined;
  if (!airline) return { title: 'Airline not found — SkyOwed' };
  return {
    title: `Claim compensation from ${airline.name} — SkyOwed`,
    description: `Delayed or cancelled ${airline.name} flight? You could be owed up to €600. Free eligibility check — SkyOwed takes 0% commission.`,
  };
}

export default function AirlinePage({ params }: { params: { slug: string } }) {
  const iata = SLUG_MAP[params.slug];
  const airline = iata ? AIRLINES.find(a => a.iata === iata) : undefined;
  if (!airline) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">Claim compensation from {airline.name}</h1>
      <p className="mt-4 text-white/70">
        Had a delayed, cancelled, or overbooked {airline.name} flight? Under EU261/UK261 regulations,
        you could be entitled to compensation of up to <strong>€600</strong> (or <strong>£520</strong> for UK routes).
      </p>

      <div className="glass mt-8 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">How to claim</h2>
        <div>
          <div className="text-sm text-white/50">Claims email</div>
          <div className="font-mono text-sm">{airline.claimsEmail}</div>
        </div>
        <div>
          <div className="text-sm text-white/50">Postal address</div>
          <div className="text-sm">{airline.postalAddress}</div>
        </div>
        <div>
          <div className="text-sm text-white/50">Expected response time</div>
          <div className="text-sm">{airline.slaDays} days</div>
        </div>
      </div>

      <div className="glass mt-6 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-3">Example compensation amounts</h2>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between"><span>Short-haul (&lt; 1500 km)</span><span className="font-bold">€250</span></div>
          <div className="flex justify-between"><span>Medium-haul (1500–3500 km)</span><span className="font-bold">€400</span></div>
          <div className="flex justify-between"><span>Long-haul (&gt; 3500 km)</span><span className="font-bold">€600</span></div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/#check" className="btn-primary inline-block text-lg">
          Check your {airline.name} flight now
        </Link>
        <p className="mt-2 text-sm text-white/40">Free check · 0% commission</p>
      </div>
    </main>
  );
}
