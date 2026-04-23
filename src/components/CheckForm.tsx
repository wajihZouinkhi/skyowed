'use client';
import { useState } from 'react';
import ResultCard from './ResultCard';
import AirportCombobox from './AirportCombobox';

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
      setTimeout(() => {
        document.getElementById('result-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  function swap() { const a = depart; setDepart(arrive); setArrive(a); }

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
        <div className="relative grid gap-4 md:grid-cols-2">
          <AirportCombobox label="From" value={depart} onChange={setDepart} />
          <AirportCombobox label="To" value={arrive} onChange={setArrive} />
          <button type="button" onClick={swap} aria-label="Swap airports" className="absolute left-1/2 top-[38px] hidden -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0b0d14] p-2 text-white/60 shadow-lg hover:text-white md:flex">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3"/></svg>
          </button>
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
          {loading ? (
            <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> Checking…</span>
          ) : 'Check my compensation'}
        </button>

        {err && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{err}</div>}
      </form>

      <div id="result-anchor" />
      {result && (
        <div className="mt-6 animate-[fadeUp_0.5s_ease-out]">
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
}
