import { NextRequest, NextResponse } from 'next/server';
import { AIRLINES, searchAirlines, findAirline } from '@/lib/airlines';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const iata = searchParams.get('iata');
  if (iata) {
    const a = findAirline(iata);
    return a ? NextResponse.json(a) : NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const results = q ? searchAirlines(q) : AIRLINES;
  return NextResponse.json({ count: results.length, airlines: results });
}
