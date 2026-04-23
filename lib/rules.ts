export const EU_COUNTRIES = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'];

interface RuleSetBase {
  jurisdiction: string;
  version: string;
  currency: string;
  delayThresholdHours: (distKm: number) => number;
  amount: (distKm: number) => number;
}
export type RuleSet = RuleSetBase;

export const EU261_v1: RuleSet = {
  jurisdiction: 'EU261', version: 'v1', currency: 'EUR',
  delayThresholdHours: (d) => 3,
  amount: (d) => d <= 1500 ? 250 : d <= 3500 ? 400 : 600,
};

export const EU261_v2: RuleSet = {
  jurisdiction: 'EU261', version: 'v2', currency: 'EUR',
  delayThresholdHours: (d) => (d <= 3500 ? 5 : 9),
  amount: (d) => d <= 3500 ? 300 : 500,
};

export const UK261: RuleSet = {
  jurisdiction: 'UK261', version: 'v1', currency: 'GBP',
  delayThresholdHours: (d) => 3,
  amount: (d) => d <= 1500 ? 220 : d <= 3500 ? 350 : 520,
};

export const TIME_LIMITS_YEARS: Record<string, number> = {
  GB: 6, FR: 5, DE: 3, ES: 5, IT: 2, NL: 2, BE: 1, IE: 6,
};

export const TIME_LIMITS_MONTHS: Record<string, number> = {};