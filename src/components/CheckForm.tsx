"use client";
import { useState } from "react";
import type { EligibilityResult } from "@/lib/eligibility";
import ResultCard from "./ResultCard";

type Form = {
  depIata: string;
  arrIata: string;
  eventType: "DELAYED" | "CANCELLED" | "DENIED_BOARDING";
  flightDate: string;
  arrivalDelayHours: string;
  cancelNoticeDays: string;
  ticketType: "normal" | "free" | "staff" | "prize";
  airlineCountry: string;
};

const empty: Form = { depIata:"", arrIata:"", eventType:"DELAYED", flightDate:"", arrivalDelayHours:"", cancelNoticeDays:"", ticketType:"normal", airlineCountry:"" };

export default function CheckForm() {
  const [form, setForm] = useState<Form>(empty);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check failed");
      setResult(data);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const inputCls = "w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-[15px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-7 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Departure airport (IATA)"><input required maxLength={3} value={form.depIata} onChange={(e)=>set("depIata", e.target.value.toUpperCase())} placeholder="LHR" className={inputCls}/></Field>
          <Field label="Arrival airport (IATA)"><input required maxLength={3} value={form.arrIata} onChange={(e)=>set("arrIata", e.target.value.toUpperCase())} placeholder="JFK" className={inputCls}/></Field>
          <Field label="Flight date"><input required type="date" value={form.flightDate} onChange={(e)=>set("flightDate", e.target.value)} className={inputCls}/></Field>
          <Field label="What happened?"><select value={form.eventType} onChange={(e)=>set("eventType", e.target.value as any)} className={inputCls}><option value="DELAYED">Delayed on arrival</option><option value="CANCELLED">Cancelled</option><option value="DENIED_BOARDING">Denied boarding (overbooked)</option></select></Field>
          {form.eventType === "DELAYED" && (<Field label="Arrival delay (hours)"><input required type="number" step="0.5" min="0" value={form.arrivalDelayHours} onChange={(e)=>set("arrivalDelayHours", e.target.value)} placeholder="3.5" className={inputCls}/></Field>)}
          {form.eventType === "CANCELLED" && (<Field label="Days notice airline gave you"><input required type="number" min="0" value={form.cancelNoticeDays} onChange={(e)=>set("cancelNoticeDays", e.target.value)} placeholder="2" className={inputCls}/></Field>)}
          <Field label="Operating airline country (ISO2)"><input required maxLength={2} value={form.airlineCountry} onChange={(e)=>set("airlineCountry", e.target.value.toUpperCase())} placeholder="DE" className={inputCls}/></Field>
          <Field label="Ticket type"><select value={form.ticketType} onChange={(e)=>set("ticketType", e.target.value as any)} className={inputCls}><option value="normal">Paid ticket</option><option value="free">Free ticket</option><option value="staff">Staff / reduced</option><option value="prize">Prize / voucher</option></select></Field>
        </div>
        <button disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl transition disabled:opacity-60">{loading ? "Checking…" : "Check my compensation"}</button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
      {result && <ResultCard r={result} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>{children}</label>);
}
