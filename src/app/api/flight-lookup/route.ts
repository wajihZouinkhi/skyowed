import { NextResponse } from 'next/server';
import { lookupFlight } from '@/lib/flightLookup';
import { limit } from '@/lib/ratelimit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  const ok = await limit(ip, 'flight-lookup');
  if (!ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  try {
    const { flightNumber, date } = await req.json();
    if (!flightNumber || !date) {
      return NextResponse.json({ error: 'flightNumber and date are required' }, { status: 400 });
    }
    const result = await lookupFlight(flightNumber, date);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'lookup_failed';
    const status = msg === 'lookup_disabled' ? 501 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
