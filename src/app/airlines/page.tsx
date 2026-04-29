import { AIRLINES } from '@/lib/airlines';

export const metadata = { title: 'Airline directory — SkyOwed' };

export default function AirlinesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Airline claims directory</h1>
      <p className="text-slate-600 mb-6">
        Where to send your EU261 / UK261 demand letter.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left border-b">
            <tr><th className="py-2">IATA</th><th>Airline</th><th>Claims email</th><th>SLA (days)</th></tr>
          </thead>
          <tbody>
            {AIRLINES.map(a => (
              <tr key={a.iata} className="border-b">
                <td className="py-2 font-mono">{a.iata}</td>
                <td>{a.name}</td>
                <td className="text-sky-600"><a href={`mailto:${a.claimsEmail}`}>{a.claimsEmail}</a></td>
                <td>{a.slaDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
