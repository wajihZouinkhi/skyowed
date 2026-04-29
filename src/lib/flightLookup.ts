export interface FlightLookupResult {
  depart: string;
  arrive: string;
  scheduledDeparture: string;
  actualArrival: string;
  airline: string;
}

export async function lookupFlight(flightNumber: string, date: string): Promise<FlightLookupResult> {
  const key = process.env.AVIATIONSTACK_API_KEY;
  if (!key) throw new Error('lookup_disabled');

  const url = `http://api.aviationstack.com/v1/flights?access_key=${encodeURIComponent(key)}&flight_iata=${encodeURIComponent(flightNumber)}&flight_date=${encodeURIComponent(date)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AviationStack returned ${res.status}`);

  const json = await res.json();
  if (json.error) throw new Error(json.error.message ?? 'AviationStack error');

  const flights = json.data;
  if (!flights || flights.length === 0) throw new Error('Flight not found');

  const f = flights[0];
  return {
    depart: f.departure?.iata ?? '',
    arrive: f.arrival?.iata ?? '',
    scheduledDeparture: f.departure?.scheduled ?? '',
    actualArrival: f.arrival?.actual ?? f.arrival?.estimated ?? '',
    airline: f.airline?.name ?? '',
  };
}
