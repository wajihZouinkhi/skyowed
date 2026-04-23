import { AIRPORTS, EU_COUNTRIES } from "./airports";
import { haversineKm } from "./haversine";
import { amountFor, delayThresholdHours, DEFAULT_TIME_BAR_DAYS, TIME_BAR_DAYS, type Jurisdiction } from "./rules";

export type EventType = "DELAYED" | "CANCELLED" | "DENIED_BOARDING";

export type CheckInput = {
  depIata: string;
  arrIata: string;
  airlineCountry: string;
  eventType: EventType;
  flightDate: string;
  arrivalDelayHours?: string | number;
  cancelNoticeDays?: string | number;
  ticketType?: "normal" | "free" | "staff" | "prize";
};

export type EligibilityResult =
  | { eligible: true; jurisdiction: Jurisdiction; amount: number; currency: "EUR" | "GBP"; distanceKm: number; warning?: string; claimTimeLeftDays?: number }
  | { eligible: false; reason: string };

function daysBetween(a: Date, b: Date) { return Math.floor((b.getTime() - a.getTime()) / 86_400_000); }

export function checkEligibility(input: CheckInput): EligibilityResult {
  const dep = AIRPORTS[input.depIata];
  const arr = AIRPORTS[input.arrIata];
  if (!dep) return { eligible: false, reason: `Unknown departure airport: ${input.depIata}` };
  if (!arr) return { eligible: false, reason: `Unknown arrival airport: ${input.arrIata}` };

  const airlineCountry = input.airlineCountry.toUpperCase();
  const isAirlineEU = EU_COUNTRIES.has(airlineCountry);
  const isAirlineUK = airlineCountry === "GB";

  let jurisdiction: Jurisdiction = "NONE";
  if (EU_COUNTRIES.has(dep.country)) jurisdiction = "EU261";
  else if (EU_COUNTRIES.has(arr.country) && isAirlineEU) jurisdiction = "EU261";
  if (dep.country === "GB") jurisdiction = "UK261";
  else if (arr.country === "GB" && (isAirlineEU || isAirlineUK)) jurisdiction = "UK261";

  if (jurisdiction === "NONE") return { eligible: false, reason: "Neither EU261 nor UK261 applies to this route and airline." };

  const tt = input.ticketType ?? "normal";
  if (tt !== "normal") return { eligible: false, reason: "Free, staff, and prize tickets are not covered by EU261/UK261." };

  const flightDate = new Date(input.flightDate);
  if (isNaN(flightDate.getTime())) return { eligible: false, reason: "Invalid flight date." };
  const now = new Date();
  const ageDays = daysBetween(flightDate, now);
  if (ageDays < 0) return { eligible: false, reason: "Flight is in the future — nothing to claim yet." };
  const bar = TIME_BAR_DAYS[dep.country] ?? DEFAULT_TIME_BAR_DAYS;
  if (ageDays > bar) return { eligible: false, reason: `Claim is older than the limit (${Math.floor(bar / 365)} years) in ${dep.country}.` };

  const distanceKm = haversineKm(dep, arr);

  if (input.eventType === "DELAYED") {
    const h = Number(input.arrivalDelayHours ?? 0);
    if (!Number.isFinite(h) || h <= 0) return { eligible: false, reason: "Arrival delay must be a positive number of hours." };
    const threshold = delayThresholdHours(distanceKm);
    if (h < threshold) return { eligible: false, reason: `Arrival delay of ${h}h is under the ${threshold}h threshold for this distance.` };
  } else if (input.eventType === "CANCELLED") {
    const daysNotice = Number(input.cancelNoticeDays ?? 0);
    if (daysNotice >= 14) return { eligible: false, reason: "Airline gave 14+ days notice of cancellation." };
  }

  const amount = amountFor(jurisdiction, distanceKm);
  const currency: "EUR" | "GBP" = jurisdiction === "UK261" ? "GBP" : "EUR";

  return {
    eligible: true, jurisdiction, amount, currency, distanceKm,
    claimTimeLeftDays: Math.max(0, bar - ageDays),
    warning: "The airline may claim 'extraordinary circumstances' (weather, strike, ATC, bird strike, etc.). Claim anyway — many such defences fail in court.",
  };
}
