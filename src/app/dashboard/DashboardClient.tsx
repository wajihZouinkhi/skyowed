'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Claim = {
  id: string;
  flight_number: string | null;
  depart: string;
  arrive: string;
  flight_date: string | null;
  delay_hours: number | null;
  reason: string | null;
  eligible: boolean | null;
  amount_eur: number | null;
  amount_gbp: number | null;
  regulation: string | null;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = ['draft', 'letter_sent', 'airline_responded', 'paid', 'rejected'] as const;

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-500/20 text-slate-300',
  letter_sent: 'bg-blue-500/20 text-blue-300',
  airline_responded: 'bg-amber-500/20 text-amber-300',
  paid: 'bg-emerald-500/20 text-emerald-300',
  rejected: 'bg-red-500/20 text-red-300',
};

export default function DashboardClient({ claims: initial, userEmail }: { claims: Claim[]; userEmail: string }) {
  const [claims, setClaims] = useState(initial);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(claimId: string, newStatus: string) {
    setUpdating(claimId);
    const supabase = createClient();
    const { error } = await supabase
      .from('claims')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', claimId);
    if (!error) {
      setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: newStatus } : c));
    }
    setUpdating(null);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My claims</h1>
          <p className="text-sm text-white/50">{userEmail}</p>
        </div>
        <form action="/auth/signout" method="POST">
          <button type="submit" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white">
            Sign out
          </button>
        </form>
      </div>

      {claims.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-white/60">No claims yet. Run a check on the home page to create one.</p>
          <a href="/" className="btn-primary mt-4 inline-block text-sm">Check a flight</a>
        </div>
      ) : (
        <ul className="space-y-3">
          {claims.map(c => (
            <li key={c.id} className="glass rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold">
                    {c.flight_number ? `${c.flight_number} · ` : ''}{c.depart} → {c.arrive}
                  </div>
                  <div className="mt-1 text-sm text-white/50">
                    {c.flight_date ?? 'Unknown date'} · {c.regulation ?? '—'}
                    {c.delay_hours ? ` · ${c.delay_hours}h delay` : ''}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {c.amount_eur != null && <div className="text-lg font-bold">€{c.amount_eur}</div>}
                  {c.amount_gbp != null && <div className="text-lg font-bold">£{c.amount_gbp}</div>}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                  disabled={updating === c.id}
                  className={`rounded-lg px-3 py-1 text-xs font-medium ${STATUS_COLORS[c.status] ?? STATUS_COLORS.draft} bg-white/5 border border-white/10`}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <span className="text-xs text-white/30">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
