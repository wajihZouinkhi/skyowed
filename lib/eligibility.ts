// The brain. Pure function, easy-to-unit-test.

import { EU_COUNTRIES, EU261_v1, UK261, EU261_v2, TIME_LIMITS_YEARS, RuleSet } from './rules';

export interface FlightInput {
  date: string; // ISO
  departureCountry: string;
  arrivalCountry: string;
  airlineCountry: string;
  distanceKm: number;
  ticketType?: 'normal' | 'free' | 'staff' | 'prize';
}

export interface EventInput {
  type: 'DELAYED' | 'CANCELLED' | 'DENIED_BOARDING';
  arrivalDelayHours?: number;
  cancellationNoticeDays?: number;
  voluntarilyGaveUpSeat?: boolean;
  rerouteArrivalDelayHours?: number;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  jurisdiction?: string;
  ruleVersion?: string;
  amount?: number;
  currency?: string;
  warning?: string;
}

export function checkEligibility(flight: FlightInput, event: EventInput): EligibilityResult {
  // 1) Jurisdiction
  let ruleSet: RuleSet | null = null;
  const REFORM_DATE = '2026-12-31';

  if (EU_COUNTRIES.includes(flight.departureCountry) || (EU_COUNTRIES.includes(flight.arrivalCountry) && EU_COUNTRIES.includes(flight.airlineCountry))) {
    ruleSet = flight.date < REFORM_DATE ? EU261_v1 : EU261_v2;
  } else if (flight.departureCountry === 'GB' || (flight.arrivalCountry === 'GB' && [...EU_COUNTRIES,'GB'].includes(flight.airlineCountry))) {
    ruleSet = UK261;
  } else {
    return { eligible: false, reason: 'No EU261/UK261 jurisdiction applies.' };
  }

  // 2) Time bar
  const limit = TIME_LIMITS_YEARS[flight.departureCountry] ?? 3;
  const yearsAgo = (Date.now() - new Date(flight.date).getTime()) / (365.25 * 86400 * 1000);
  if (yearsAgo > limit) return { eligible: false, reason: `Claim older than ${limit} years allowed in ${flight.departureCountry}.` };

  // 3) Ticket
  if (flight.ticketType && ['free','staff','prize'].includes(flight.ticketType)) {
    return { eligible: false, reason: 'Free/reduced-fare tickets not covered.' };
  }

  // 4) Event
  if (event.type === 'DELAYED') {
    const threshold = ruleSet.delayThresholdHours(flight.distanceKm);
    if ((event.arrivalDelayHours ?? 0) < threshold) {
      return { eligible: false, reason: `Delay under ${threshold}h threshold.` };
    }
  }
  if (event.type === 'CANCELLED') {
    if ((event.cancellationNoticeDays ?? 0) >= 14) {
      return { eligible: false, reason: 'Notified 14+ days in advance.' };
    }
  }
  if (event.type === 'DENIED_BOARDING' && event.voluntarilyGaveUpSeat) {
    return { eligible: false, reason: 'You voluntarily gave up your seat.' };
  }

  // 5) Amount
  const amount = ruleSet.amount(flight.distanceKm);

  return {
    eligible: true,
    jurisdiction: ruleSet.jurisdiction,
    ruleVersion: ruleSet.version,
    amount,
    currency: ruleSet.currency,
    warning: 'The airline may try to claim extraordinary circumstances. If they refuse, you can appeal.' };
}