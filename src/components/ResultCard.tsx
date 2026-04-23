'use client';
import { useEffect, useState } from 'react';

type Props = { result: any };

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

export default function ResultCard({ result }: Props) {
  const eligible = result?.eligible;
  const eu = result?.amounts?.eu ?? 0;
  const uk = result?.amounts?.uk ?? 0;
  const distance = result?.distanceKm;
  const reason = result?.reason;
  const euCount = useCountUp(eligible ? eu : 0);

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
                  <div className="text-5xl font-extrabold gradient-text tabular-nums md:text-6xl">€{euCount}</div>
                  <div className="text-lg text-white/60">or £{uk}</div>
                </div>
              </div>
            ) : (
              <div className="text-2xl font-bold">Not eligible under current rules</div>
            )}
          </div>
        </div>
        {eligible && (
          <button className="btn-primary w-full whitespace-nowrap md:w-auto">Generate claim letter</button>
        )}
      </div>

      {reason && <p className="relative mt-4 text-sm text-white/60">{reason}</p>}

      <div className="relative mt-5 grid gap-3 border-t border-white/5 pt-5 text-sm md:grid-cols-3">
        <div><div className="text-white/50">Distance</div><div className="font-semibold">{distance ? `${Math.round(distance)} km` : '—'}</div></div>
        <div><div className="text-white/50">Regulation</div><div className="font-semibold">EU261 · UK261</div></div>
        <div><div className="text-white/50">Time to claim</div><div className="font-semibold">Up to 6 years</div></div>
      </div>
    </div>
  );
}
