type Props = { result: any };

export default function ResultCard({ result }: Props) {
  const eligible = result?.eligible;
  const eu = result?.amounts?.eu;
  const uk = result?.amounts?.uk;
  const distance = result?.distanceKm;
  const reason = result?.reason;

  return (
    <div className={`rounded-2xl p-6 ${eligible ? 'border border-emerald-400/30 bg-emerald-400/5' : 'border border-white/10 bg-white/[0.03]'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={`chip ${eligible ? 'bg-emerald-400/15 text-emerald-300' : ''}`}>
            {eligible ? '✓ Likely eligible' : '✗ Likely not eligible'}
          </div>
          <div className="mt-4">
            {eligible ? (
              <div>
                <div className="text-sm text-white/60">Estimated compensation</div>
                <div className="mt-1 flex items-baseline gap-3">
                  <div className="text-5xl font-extrabold gradient-text">€{eu}</div>
                  <div className="text-lg text-white/60">or £{uk}</div>
                </div>
              </div>
            ) : (
              <div className="text-2xl font-bold">Not eligible under current rules</div>
            )}
          </div>
        </div>
        {eligible && (
          <button className="btn-primary whitespace-nowrap">Generate claim letter</button>
        )}
      </div>

      {reason && <p className="mt-4 text-sm text-white/60">{reason}</p>}

      <div className="mt-5 grid gap-3 border-t border-white/5 pt-5 text-sm md:grid-cols-3">
        <div><div className="text-white/50">Distance</div><div className="font-semibold">{distance ? `${Math.round(distance)} km` : '—'}</div></div>
        <div><div className="text-white/50">Regulation</div><div className="font-semibold">EU261 · UK261</div></div>
        <div><div className="text-white/50">Time to claim</div><div className="font-semibold">Up to 6 years</div></div>
      </div>
    </div>
  );
}
