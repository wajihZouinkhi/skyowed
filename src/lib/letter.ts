import type { EligibilityResult } from './eligibility';

export type LetterInput = {
  passengerName: string;
  passengerAddress: string;
  bookingRef: string;
  flightNumber: string;
  flightDate: string;
  depIata: string;
  arrIata: string;
  eventType: 'DELAYED' | 'CANCELLED' | 'DENIED_BOARDING';
  arrivalDelayHours?: number;
  airlineName: string;
  airlineAddress?: string;
  iban?: string;
  lang?: 'en' | 'fr' | 'de' | 'es';
};

export type ClaimInput = {
  passenger: { fullName: string; address: string; pnr: string; iban: string };
  airline: { name: string; address: string };
  flightNumber: string;
  departure: string;
  arrival: string;
  date: string;
  amount: number;
  basis: string;
};

const TEMPLATES: Record<string, (i: LetterInput, r: Extract<EligibilityResult,{eligible:true}>) => string> = {
  en: (i, r) => `To: ${i.airlineName}
${i.airlineAddress ?? ''}

Claim for compensation under Regulation (EC) 261/2004 / UK Regulation 261
Passenger: ${i.passengerName}
Address: ${i.passengerAddress}
Booking reference: ${i.bookingRef}
Flight: ${i.flightNumber} on ${i.flightDate}
Route: ${i.depIata} → ${i.arrIata}

Dear Sir or Madam,

I am writing to claim the compensation I am entitled to under ${r.jurisdiction} for the above flight, which ${
  i.eventType === 'DELAYED' ? `arrived ${i.arrivalDelayHours} hours late at the final destination`
  : i.eventType === 'CANCELLED' ? 'was cancelled without sufficient notice'
  : 'on which I was denied boarding against my will'
}.

Flight distance is ${r.distanceKm.toFixed(0)} km, which entitles me to ${r.currency} ${r.amount} per passenger.

Please transfer the amount to the following account within 14 days:
IBAN: ${i.iban ?? '[IBAN]'}
Account holder: ${i.passengerName}

If I do not receive full payment within 14 days, I will escalate this claim to the national enforcement body and, if necessary, take court action. All legal costs will be added to the claim.

Yours faithfully,
${i.passengerName}
Date: ${new Date().toISOString().slice(0,10)}
`,
};

export function buildLetter(i: LetterInput, r: Extract<EligibilityResult,{eligible:true}>): string {
  const fn = TEMPLATES[i.lang ?? 'en'] ?? TEMPLATES.en;
  return fn(i, r);
}

export function renderLetter(input: ClaimInput): string {
  const today = new Date().toISOString().slice(0, 10);
  const { passenger, airline, flightNumber, departure, arrival, date, amount, basis } = input;
  return [
    passenger.fullName,
    passenger.address,
    '',
    today,
    '',
    airline.name,
    'Customer Relations / Claims',
    airline.address,
    '',
    `Subject: Compensation claim — ${basis} — Flight ${flightNumber} on ${date}`,
    '',
    'Dear Sir or Madam,',
    '',
    `I was a passenger on flight ${flightNumber} operated by ${airline.name} on ${date}, from ${departure} to ${arrival} (booking reference: ${passenger.pnr}).`,
    '',
    `Under ${basis === 'UK261' ? 'UK Regulation 261' : 'Regulation (EC) No 261/2004'}, I am entitled to compensation of ${amount} EUR.`,
    '',
    `I request that you transfer ${amount} EUR within 14 days to the following account: ${passenger.iban}.`,
    '',
    'Failing payment within this period, I reserve the right to escalate to the national enforcement body and to take court action.',
    '',
    'Yours faithfully,',
    '',
    passenger.fullName,
    '',
    '— Enclosures: boarding pass, booking confirmation.',
  ].join('\n');
}
