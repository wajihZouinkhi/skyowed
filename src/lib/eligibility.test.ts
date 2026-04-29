import test from 'node:test';
import assert from 'node:assert/strict';
import { checkEligibility } from './eligibility';

test('EU261 eligible for 4h delay long haul from EU', () => {
  const r = checkEligibility({
    depIata: 'CDG', arrIata: 'JFK', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 5,
  });
  assert.equal(r.eligible, true);
  if (r.eligible) {
    assert.equal(r.jurisdiction, 'EU261');
    assert.equal(r.currency, 'EUR');
    assert.equal(r.amount, 600);
  }
});

test('Not eligible when delay under threshold', () => {
  const r = checkEligibility({
    depIata: 'CDG', arrIata: 'LHR', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 1,
  });
  assert.equal(r.eligible, false);
});

test('UK261 for GB departure', () => {
  const r = checkEligibility({
    depIata: 'LHR', arrIata: 'CDG', airlineCountry: 'GB',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 4,
  });
  assert.equal(r.eligible, true);
  if (r.eligible) {
    assert.equal(r.jurisdiction, 'UK261');
    assert.equal(r.currency, 'GBP');
  }
});

test('Cancellation with 14+ days notice not eligible', () => {
  const r = checkEligibility({
    depIata: 'MAD', arrIata: 'FRA', airlineCountry: 'DE',
    eventType: 'CANCELLED', flightDate: '2024-06-01', cancelNoticeDays: 30,
  });
  assert.equal(r.eligible, false);
});

test('Non-EU route is not covered', () => {
  const r = checkEligibility({
    depIata: 'JFK', arrIata: 'LAX', airlineCountry: 'US',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 10,
  });
  assert.equal(r.eligible, false);
});
