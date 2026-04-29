import type { FC } from 'react';

export interface ClaimRow {
  id: string;
  flightNumber: string;
  route: string;
  date: string;
  amountEur: number;
  status: string;
}

export const ClaimsList: FC<{ claims: ClaimRow[] }> = ({ claims }) => {
  if (claims.length === 0) {
    return <p className="text-slate-500">No claims yet.</p>;
  }
  return (
    <ul className="divide-y">
      {claims.map(c => (
        <li key={c.id} className="py-3 flex justify-between">
          <div>
            <div className="font-semibold">{c.flightNumber} — {c.route}</div>
            <div className="text-sm text-slate-500">{c.date}</div>
          </div>
          <div className="text-right">
            <div className="font-bold">€{c.amountEur}</div>
            <span className="text-xs uppercase text-slate-500">{c.status}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};
