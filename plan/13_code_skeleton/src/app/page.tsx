'use client';
import { useState } from 'react';

export default function Home() {
  const [flightNumber, setFlightNumber] = useState('');
  const [date, setDate] = useState('');
  const [delayHours, setDelayHours] = useState(3);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/check', {
      method: 'POST',
      body: JSON.stringify({ flightNumber, date, eventType: 'DELAYED', arrivalDelayHours: delayHours }),
    });
    setResult(await res.json());
    setLoading(false);
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Was your flight delayed?</h1>
      <p className="text-gray-600 mb-6">You could be owed up to €600. Keep 100% — we're just a tool.</p>
      <form onSubmit={submit} className="space-y-4">
        <input className="border p-3 w-full rounded" placeholder="Flight number (e.g. LH441)" value={flightNumber} onChange={e=>setFlightNumber(e.target.value)} required />
        <input type="date" className="border p-3 w-full rounded" value={date} onChange={e=>setDate(e.target.value)} required />
        <input type="number" className="border p-3 w-full rounded" placeholder="Hours late at final destination" value={delayHours} onChange={e=>setDelayHours(Number(e.target.value))} />
        <button className="bg-orange-500 text-white p-3 w-full rounded font-semibold" disabled={loading}>
          {loading ? 'Checking...' : 'Check if I am eligible'}
        </button>
      </form>
      {result && (
        <div className="mt-6 p-6 border rounded bg-gray-50">
          {result.result?.eligible ? (
            <>
              <h2 className="text-xl font-bold text-green-700">You may be owed {result.result.currency} {result.result.amount}!</h2>
              <p className="text-sm text-gray-600 mt-2">{result.result.warning}</p>
              <button className="mt-4 bg-blue-700 text-white p-3 rounded w-full">Generate my claim letter (€6.99)</button>
            </>
          ) : (
            <p>Not eligible: {result.result?.reason ?? result.error}</p>
          )}
        </div>
      )}
    </main>
  );
}
