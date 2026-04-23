'use client';
import { useState } from 'react';
import ResultCard from './ResultCard';

type Reason = 'delay' | 'cancellation' | 'denied_boarding';

export default function CheckForm() {
  const [depart, setDepart] = useState('CDG');
  const [arrive, setArrive] = useState('JFK');
  const [delayHours, setDelayHours] = useState(4);
  const [reason, setReason] = useState<Reason>('delay');
  const [extraordinary, setExtraordinary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null); setResult(null);
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depart, arrive, delayHours: Number(delayHours), reason, extraordinary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Check failed');
      setResult(data);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl shadow-violet-500/10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Flight eligibility check</h3>
          <p className="text-sm text-white/50">Takes 30 seconds · free</p>
        </div>
        <span className="chip">EU261 · UK261</span>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">From (IATA)</label>
            <input className="field uppercase" maxLength={3} value={depart} onChange={(e) => setDepart(e.target.value.toUpperCase())} placeholder="CDG" />
          </div>
          <div>
            <label className="label">To (IATA)</label>
            <input className="field uppercase" maxLength={3} value={arrive} onChange={(e) => setArrive(e.target.value.toUpperCase())} placeholder="JFK" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Arrival delay (hours)</label>
            <input type="number" min={0} max={48} step={0.5} className="field" value={delayHours} onChange={(e) => setDelayHours(parseFloat(e.target.value || '0'))} />
          </div>
          <div>
            <label className="label">Reason</label>
            <select className="field" value={reason} onChange={(e) => setReason(e.target.value as Reason)}>
              <option value="delay">Delay</option>
              <option value="cancellation">Cancellation</option>
              <option value="denied_boarding">Denied boarding</option>
            </select>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06]">
          <input type="checkbox" checked={extraordinary} onChange={(e) => setExtraordinary(e.target.checked)} className="mt-0.5 h-4 w-4 accent-violet-500" />
          <span className="text-sm text-white/70">
            <b className="text-white">Extraordinary circumstances</b> — storms, strikes outside the airline, air-traffic control. If yes, airline is exempt.
          </span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Checking…' : 'Check my compensation'}
        </button>

        {err && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{err}</div>}
      </form>

      {result && (
        <div className="mt-6">
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
}
