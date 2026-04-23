import { NextRequest, NextResponse } from 'next/server';
import { checkEligibility, FlightInput, EventInput } from '@/lib/eligibility';

// Stub: you'll replace this with real flight-data-API results
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Fake lookup: pretend the flight was LH, FRA-→JFK, distance 6600 km, Deutsche Lufthansa.
  const flight: FlightInput = {
    date: body.date,
    departureCountry: 'DE',
    arrivalCountry: 'US',
    airlineCountry: 'DE',
    distanceKm: 6600,
  };
  const event: EventInput = { type: 'DELAYED', arrivalDelayHours: body.arrivalDelayHours };

  try {
    const result = checkEligibility(flight, event);
    return NextResponse.json({ result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}