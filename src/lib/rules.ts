export type Jurisdiction = "EU261" | "UK261" | "NONE";

export const TIME_BAR_DAYS: Record<string, number> = {
  GB: 6 * 365, IE: 6 * 365, DE: 3 * 365, FR: 5 * 365, ES: 5 * 365,
  IT: 2 * 365, NL: 2 * 365, BE: 1 * 365, PT: 3 * 365, PL: 1 * 365, AT: 3 * 365,
};
export const DEFAULT_TIME_BAR_DAYS = 3 * 365;

export function amountFor(jurisdiction: Jurisdiction, distanceKm: number): number {
  if (jurisdiction === "UK261") {
    if (distanceKm <= 1500) return 220;
    if (distanceKm <= 3500) return 350;
    return 520;
  }
  if (distanceKm <= 1500) return 250;
  if (distanceKm <= 3500) return 400;
  return 600;
}

export function delayThresholdHours(distanceKm: number): number {
  if (distanceKm <= 1500) return 3;
  if (distanceKm <= 3500) return 3;
  return 4;
}
