import type { EligibilityResult } from './eligibility';

// ClaimInput is used by locale-specific letter renderers (letter.fr.ts, letter.de.ts, letter.es.ts)
export type ClaimInput = {
  passenger: { fullName: string; address: string; pnr: string; iban: string };
  airline: { name: string; address?: string };
  flightNumber: string;
  departure: string;
  arrival: string;
  date: string;
  amount: string | number;
  basis: string;
};

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

export const renderLetter = (i: LetterInput, r?: Extract<EligibilityResult,{eligible:true}>) =>
  buildLetter(i, r ?? { eligible: true, jurisdiction: 'EU261', amount: 0, currency: 'EUR', distanceKm: 0 });
