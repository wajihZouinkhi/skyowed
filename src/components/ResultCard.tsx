import type { EligibilityResult } from "@/lib/eligibility";

export default function ResultCard({ r }: { r: EligibilityResult }) {
  if (!r.eligible) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="text-2xl">😕</div>
        <h2 className="mt-2 text-xl font-bold">Not eligible</h2>
        <p className="mt-2 text-slate-600">{r.reason}</p>
      </div>
    );
  }
  return (
    <div className="bg-gradient-to-br from-brand to-brand-dark text-white rounded-2xl p-6 sm:p-8 shadow-lg">
      <div className="text-sm opacity-80">Estimated compensation</div>
      <div className="mt-1 text-4xl sm:text-5xl font-extrabold">{r.currency === "GBP" ? "£" : "€"}{r.amount}</div>
      <div className="mt-3 text-sm opacity-90">Jurisdiction: <b>{r.jurisdiction}</b> · Distance: <b>{r.distanceKm} km</b></div>
      {r.claimTimeLeftDays !== undefined && (<div className="mt-1 text-sm opacity-90">Claim window remaining: <b>{r.claimTimeLeftDays} days</b></div>)}
      {r.warning && (<div className="mt-4 bg-white/15 rounded-lg p-3 text-sm">⚠️ {r.warning}</div>)}
      <div className="mt-5 text-xs opacity-80">Next step: generate the claim letter (coming soon — PDF in EN/FR/DE/ES).</div>
    </div>
  );
}
