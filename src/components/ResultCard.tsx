'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { hapticMedium, isNative } from '@/lib/native';
import { isPro } from '@/lib/pro';
import { buildLetter } from '@/lib/letter';
import { buildPdf } from '@/lib/pdf';
import { downloadPdf } from '@/lib/pdfDownload';
import type { EligibilityResult, EventType } from '@/lib/eligibility';

type Props = {
  result: EligibilityResult | null;
  depIata: string;
  arrIata: string;
  flightDate: string;
  eventType: EventType;
  arrivalDelayHours?: number;
};

function useCountUp(target: number, duration = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!target) { setN(0); return; }
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

export default function ResultCard({ result, depIata, arrIata, flightDate, eventType, arrivalDelayHours }: Props) {
  const eligible = result?.eligible ?? false;
  const amount = result && 'amount' in result ? result.amount : 0;
  const currency = result && 'currency' in result ? result.currency : 'EUR';
  const distance = result && 'distanceKm' in result ? result.distanceKm : undefined;
  const reasonText = result && 'reason' in result ? result.reason : undefined;
  const count = useCountUp(eligible ? amount : 0);
  const [showLetter, setShowLetter] = useState(false);
  const [pro, setPro] = useState(false);
  const [letterText, setLetterText] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [pName, setPName] = useState('');
  const [pAddress, setPAddress] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [airlineName, setAirlineName] = useState('');
  const [iban, setIban] = useState('');

  useEffect(() => {
    isPro().then(setPro);
  }, []);

  async function generateLetter() {
    if (!result || !result.eligible) return;
    setGenerating(true);
    await hapticMedium();
    const input = {
      passengerName: pName || 'Passenger',
      passengerAddress: pAddress || '',
      bookingRef: bookingRef || '',
      flightNumber: '',
      flightDate,
      depIata,
      arrIata,
      eventType,
      arrivalDelayHours,
      airlineName: airlineName || 'the airline',
      iban: iban || undefined,
      lang: 'en' as const,
    };
    const txt = buildLetter(input, result);
    setLetterText(txt);
    setGenerating(false);
  }

  async function handleShare() {
    await hapticMedium();
    const title = 'SkyOwed Claim Letter';
    const text = letterText || `SkyOwed claim — estimated compensation: ${currency === 'EUR' ? '€' : '£'}${amount}`;
    if (await isNative()) {
      try {
        const { Share } = await import('@capacitor/share');
        await Share.share({ title, text });
        return;
      } catch {}
    }
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try { await (navigator as any).share({ title, text }); return; } catch {}
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try { await navigator.clipboard.writeText(text); alert('Letter copied to clipboard'); return; } catch {}
    }
    const mailto = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;
    window.open(mailto, '_blank');
  }

  async function handleDownloadPdf() {
    await hapticMedium();
    if (!letterText) return;
    setGenerating(true);
    try {
      const pdf = await buildPdf(letterText, { title: 'SkyOwed Claim Letter' });
      await downloadPdf(pdf, 'SkyOwed-claim-letter.pdf');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 ${eligible ? 'border border-emerald-400/30 bg-emerald-400/5' : 'border border-white/10 bg-white/[0.03]'}`}>
      {eligible && <div className="pointer-events-none absolute inset-0 shimmer" />}
      <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row">
        <div className="min-w-0">
          <div className={`chip ${eligible ? 'bg-emerald-400/15 text-emerald-300' : ''}`}>
            {eligible ? '✓ Likely eligible' : '✗ Likely not eligible'}
          </div>
          <div className="mt-4">
            {eligible ? (
              <div>
                <div className="text-sm text-white/60">Estimated compensation</div>
                <div className="mt-1 flex items-baseline gap-3">
                  <div className="text-5xl font-extrabold gradient-text tabular-nums md:text-6xl">{currency === 'EUR' ? '€' : '£'}{count}</div>
                </div>
              </div>
            ) : (
              <div className="text-2xl font-bold">Not eligible under current rules</div>
            )}
          </div>
        </div>
        {eligible && (
          <button className="btn-primary w-full whitespace-nowrap md:w-auto" onClick={async () => { await hapticMedium(); setShowLetter(!showLetter); }}>
            {showLetter ? 'Hide letter' : 'Generate claim letter'}
          </button>
        )}
      </div>

      {reasonText && <p className="relative mt-4 text-sm text-white/60">{reasonText}</p>}

      {showLetter && eligible && (
        <div className="relative mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          {!pro ? (
            <div className="text-center">
              <p className="mb-2 font-semibold text-white/80">Pro feature</p>
              <p className="text-white/50">Claim letter generation is a Pro feature.</p>
              <Link href="/upgrade" className="btn-primary mt-3 inline-block text-xs">
                Unlock Pro — €6.99
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-2 font-semibold text-white/80">Claim letter</p>
              {!letterText ? (
                <div className="space-y-3">
                  <input className="field" placeholder="Passenger full name" value={pName} onChange={e => setPName(e.target.value)} />
                  <input className="field" placeholder="Address (city, country)" value={pAddress} onChange={e => setPAddress(e.target.value)} />
                  <input className="field" placeholder="Booking reference" value={bookingRef} onChange={e => setBookingRef(e.target.value)} />
                  <input className="field" placeholder="Airline name (optional)" value={airlineName} onChange={e => setAirlineName(e.target.value)} />
                  <input className="field" placeholder="IBAN for payout (optional)" value={iban} onChange={e => setIban(e.target.value)} />
                  <button className="btn-primary w-full text-xs" onClick={generateLetter} disabled={generating}>
                    {generating ? 'Generating…' : 'Generate claim letter'}
                  </button>
                </div>
              ) : (
                <>
                  <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-white/70">{letterText}</pre>
                  <div className="mt-3 flex gap-2">
                    <button onClick={handleShare} className="btn-primary flex-1 text-xs">Share</button>
                    <button onClick={handleDownloadPdf} className="btn-primary flex-1 text-xs">Download PDF</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      <div className="relative mt-5 grid gap-3 border-t border-white/5 pt-5 text-sm md:grid-cols-3">
        <div><div className="text-white/50">Distance</div><div className="font-semibold">{distance ? `${Math.round(distance)} km` : '—'}</div></div>
        <div><div className="text-white/50">Regulation</div><div className="font-semibold">{result && 'jurisdiction' in result ? result.jurisdiction : '—'}</div></div>
        <div><div className="text-white/50">Time to claim</div><div className="font-semibold">Up to 6 years</div></div>
      </div>
    </div>
  );
}
