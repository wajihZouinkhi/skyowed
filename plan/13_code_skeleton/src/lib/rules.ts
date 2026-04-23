// Regulation data — the source of truth for the eligibility engine

export const EU_COUNTRIES = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','NO'];

export interface RuleSet {
  jurisdiction: 'EU261' | 'UK261';
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  currency: 'EUR' | 'GBP';
  delayThresholdHours: (distanceKm: number) => number;
  amount: (distanceKm: number) => number;
}

export const EU261_v1: RuleSet = {
  jurisdiction: 'EU261',
  version: 'v1-2004',
  effectiveFrom: '2004-02-17',
  currency: 'EUR',
  delayThresholdHours: () => 3,
  amount: (km) => km <= 1500 ? 250 : km <= 3500 ? 400 : 600,
};

export const UK261: RuleSet = {
  jurisdiction: 'UK261',
  version: 'v1-post-brexit',
  effectiveFrom: '2020-01-31',
  currency: 'GBP',
  delayThresholdHours: () => 3,
  amount: (km) => km <= 1500 ? 220 : km <= 3500 ? 350 : 520,
};

// Post-reform (future, date TBD):
export const EU261_v2: RuleSet = {
  jurisdiction: 'EU261',
  version: 'v2-reform',
  effectiveFrom: '2026-12-31', // placeholder — UPDATE when published
  currency: 'EUR',
  delayThresholdHours: (km) => km <= 3500 ? 4 : 6,
  amount: (km) => km <= 3500 ? 300 : 500,
};

export const TIME_LIMITS_YEARS: Record<string, number> = {
  GB: 6, IE: 6, FR: 5, ES: 5, DE: 3, AT: 3, PT: 3, SE: 3, DK: 3,
  NL: 2, IT: 2, BE: 1, PL: 1, CZ: 3, HU: 5, GR: 5, FI: 3, LU: 10,
};
