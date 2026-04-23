import { NextResponse } from 'next/server';
import { checkEligibility } from '@/lib/eligibility';

export async function POST(req: Request) {
  const body = await req.json();
  // body: { flightNumber, date, eventType, arrivalDelayHours, ... }

  // 1) Look up flight on AviationStack
  const key = process.env.AVIATIONSTACK_KEY!;
  const r = await fetch(`https://api.aviationstack.com/v1/flights?access_key=${key}&flight_iata=${body.flightNumber}&flight_date=${body.date}`);
  const data = await r.json();
  const f = data.data?.[0];
  if (!f) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });

  // 2) Build flight input (you'd also compute distance via airport lookup)
  const flight = {
    date: body.date,
    departureCountry: f.departure?.country_iso2 ?? '',
    arrivalCountry:   f.arrival?.country_iso2 ?? '',
    airlineCountry:   f.airline?.country_iso2 ?? '',
    distanceKm: body.distanceKm ?? 0,
  };

  const result = checkEligibility(flight, {
    type: body.eventType,
    arrivalDelayHours: body.arrivalDelayHours,
    cancellationNoticeDays: body.cancellationNoticeDays,
  });

  return NextResponse.json({ flight: f, result });
}
