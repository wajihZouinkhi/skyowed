import { test } from "node:test";
import assert from "node:assert/strict";
import { checkEligibility } from "./eligibility";

const lastMonth = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

test("EU261 short-haul 3h delay → €250", () => {
  const r = checkEligibility({ depIata:"CDG", arrIata:"FRA", airlineCountry:"DE", eventType:"DELAYED", flightDate: lastMonth, arrivalDelayHours: 3.5 });
  assert.equal(r.eligible, true);
  if (r.eligible) { assert.equal(r.jurisdiction, "EU261"); assert.equal(r.amount, 250); assert.equal(r.currency, "EUR"); }
});

test("UK261 long-haul 5h delay → £520", () => {
  const r = checkEligibility({ depIata:"LHR", arrIata:"JFK", airlineCountry:"GB", eventType:"DELAYED", flightDate: lastMonth, arrivalDelayHours: 5 });
  assert.equal(r.eligible, true);
  if (r.eligible) { assert.equal(r.jurisdiction, "UK261"); assert.equal(r.amount, 520); }
});

test("Delay under threshold → not eligible", () => {
  const r = checkEligibility({ depIata:"FRA", arrIata:"MAD", airlineCountry:"DE", eventType:"DELAYED", flightDate: lastMonth, arrivalDelayHours: 2 });
  assert.equal(r.eligible, false);
});

test("14+ day cancellation notice → not eligible", () => {
  const r = checkEligibility({ depIata:"FRA", arrIata:"MAD", airlineCountry:"DE", eventType:"CANCELLED", flightDate: lastMonth, cancelNoticeDays: 20 });
  assert.equal(r.eligible, false);
});

test("Non-EU/UK route → not eligible", () => {
  const r = checkEligibility({ depIata:"JFK", arrIata:"LAX", airlineCountry:"US", eventType:"DELAYED", flightDate: lastMonth, arrivalDelayHours: 5 });
  assert.equal(r.eligible, false);
});
