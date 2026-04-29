'use client';
import { useState } from 'react';
import ResultCard from './ResultCard';
import AirportCombobox from './AirportCombobox';
import { checkEligibility, type EligibilityResult, type EventType } from '@/lib/eligibility';
import { saveLocalClaim } from '@/lib/localClaims';
import { hapticLight, hapticSuccess, hapticError } from '@/lib/native';
import { AIRPORTS } from '@/lib/airports';

const REASON_MAP: Record<string, EventType> = {
  delay: 'DELAYED',
  cancellation: 'CANCELLED',
  denied_boarding: 'DENIED_BOARDING',
};

export default function CheckForm() {
  const [depart, setDepart] = useState('CDG');
  const [arrive, setArrive] = useState('JFK');
  const [flightDate, setFlightDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [delayHours, setDelayHours] = useState(4);
  const [reason, setReason] = useState('delay');
  const [extraordinary, setExtraordinary] = useState(false);
  const [flightNumber, setFlightNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await hapticLight();
    setLoading(true); setErr(null); setResult(null);
    try {
      const dep = AIRPORTS[depart.toUpperCase()];
      const arr = AIRPORTS[arrive.toUpperCase()];
      if (!dep) throw new Error(`Unknown departure airport: ${depart}`);
      if (!arr) throw new Error(`Unknown arrival airport: ${arrive}`);

      const data = checkEligibility({
        depIata: depart.toUpperCase(),
        arrIata: arrive.toUpperCase(),
        airlineCountry: dep.country,
        eventType: REASON_MAP[reason] || 'DELAYED',
        flightDate,
        arrivalDelayHours: Number(delayHours),
      });

      if (data.eligible) await hapticSuccess();
      else await hapticError();

      setResult(data);

      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible('flight_check', { props: { eligible: data.eligible } });
      }

      if (data.eligible) {
        await saveLocalClaim({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          depIata: depart.toUpperCase(),
          arrIata: arrive.toUpperCase(),
          flightDate,
          eventType: REASON_MAP[reason] || 'DELAYED',
          eligible: true,
          amount: data.amount,
          currency: data.currency,
          jurisdiction: data.jurisdiction,
        });
      }

      setTimeout(() => {
        document.getElementById('result-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    } catch (e: any) {
      await hapticError();
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function lookupFlight() {
    if (!flightNumber || !flightDate) return;
    setLookingUp(true); setErr(null);
    try {
      const res = await fetch('/api/flight-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightNumber, date: flightDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Lookup failed');
      if (data.depart) setDepart(data.depart);
      if (data.arrive) setArrive(data.arrive);
      if (data.actualArrival && data.scheduledDeparture) {
        const scheduled = new Date(data.scheduledDeparture);
        const actual = new Date(data.actualArrival);
        const diffHours = Math.max(0, (actual.getTime() - scheduled.getTime()) / 3_600_000);
        if (diffHours > 0) setDelayHours(Math.round(diffHours * 10) / 10);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Lookup failed';
      if (msg === 'lookup_disabled') setErr('Flight lookup is not configured.');
      else setErr(msg);
    } finally {
      setLookingUp(false);
    }
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
        <div>
          <label className="label">Flight number (optional — auto-fills airports &amp; delay)</label>
          <div className="flex gap-2">
            <input className="field flex-1" placeholder="e.g. FR1234" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} />
            <button type="button" onClick={lookupFlight} disabled={lookingUp || !flightNumber} className="btn-primary shrink-0 text-sm">
              {lookingUp ? 'Looking up…' : 'Look up'}
            </button>
          </div>
        </div>

        <div className="relative grid gap-4 md:grid-cols-2">
          <AirportCombobox label="From" value={depart} onChange={setDepart} />
          <AirportCombobox label="To" value={arrive} onChange={setArrive} />
          <button type="button" onClick={swap} aria-label="Swap airports" className="absolute left-1/2 top-[38px] hidden -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0b0d14] p-2 text-white/60 shadow-lg hover:text-white md:flex">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3"/></svg>
          </button>
        </div>

        <div>
          <label className="label">Flight date</label>
          <input type="date" className="field" value={flightDate} onChange={(e) => setFlightDate(e.target.value)} enterKeyHint="next" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Arrival delay (hours)</label>
            <input type="number" min={0} max={48} step={0.5} inputMode="numeric" enterKeyHint="next" className="field" value={delayHours} onChange={(e) => setDelayHours(parseFloat(e.target.value || '0'))} />
          </div>
          <div>
            <label className="label">Reason</label>
            <select className="field" value={reason} onChange={(e) => setReason(e.target.value)}>
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
          <ResultCard
            result={result}
            depIata={depart.toUpperCase()}
            arrIata={arrive.toUpperCase()}
            flightDate={flightDate}
            eventType={REASON_MAP[reason] || 'DELAYED'}
            arrivalDelayHours={Number(delayHours)}
          />
        </div>
      )}
    </div>
  );
}
