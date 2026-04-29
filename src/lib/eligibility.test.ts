import test from 'node:test';
import assert from 'node:assert/strict';
import { checkEligibility } from './eligibility';

// --- Short-haul EU departures ---

test('1. EU261 eligible — short-haul EU, 3h delay', () => {
  const r = checkEligibility({
    depIata: 'CDG', arrIata: 'AMS', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2024-06-01', arrivalDelayHours: 3,
  });
  assert.equal(r.eligible, true);
  if (r.eligible) {
    assert.equal(r.jurisdiction, 'EU261');
    assert.equal(r.amount, 250);
    assert.equal(r.currency, 'EUR');
  }
});

test('2. EU261 not eligible — short-haul, 2h delay (under threshold)', () => {
  const r = checkEligibility({
    depIata: 'CDG', arrIata: 'LHR', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 2,
  });
  assert.equal(r.eligible, false);
});

// --- Medium-haul EU departures ---

test('3. EU261 eligible — medium-haul, 3h delay', () => {
  const r = checkEligibility({
    depIata: 'MAD', arrIata: 'IST', airlineCountry: 'ES',
    eventType: 'DELAYED', flightDate: '2024-03-01', arrivalDelayHours: 3,
  });
  assert.equal(r.eligible, true);
  if (r.eligible) {
    assert.equal(r.amount, 400);
  }
});

// --- Long-haul EU departures ---

test('4. EU261 eligible — long-haul, 4h delay, €600', () => {
  const r = checkEligibility({
    depIata: 'CDG', arrIata: 'JFK', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 5,
  });
  assert.equal(r.eligible, true);
  if (r.eligible) {
    assert.equal(r.jurisdiction, 'EU261');
    assert.equal(r.amount, 600);
    assert.equal(r.currency, 'EUR');
  }
});

test('5. EU261 not eligible — long-haul, 3h delay (needs 4h)', () => {
  const r = checkEligibility({
    depIata: 'FRA', arrIata: 'JFK', airlineCountry: 'DE',
    eventType: 'DELAYED', flightDate: '2024-04-01', arrivalDelayHours: 3,
  });
  assert.equal(r.eligible, false);
});

// --- Cancellation ---

test('6. EU261 eligible — cancellation with <14 days notice', () => {
  const r = checkEligibility({
    depIata: 'AMS', arrIata: 'BCN', airlineCountry: 'NL',
    eventType: 'CANCELLED', flightDate: '2024-06-01', cancelNoticeDays: 7,
  });
  assert.equal(r.eligible, true);
  if (r.eligible) {
    assert.equal(r.jurisdiction, 'EU261');
  }
});

test('7. Not eligible — cancellation with 14+ days notice', () => {
  const r = checkEligibility({
    depIata: 'MAD', arrIata: 'FRA', airlineCountry: 'DE',
    eventType: 'CANCELLED', flightDate: '2024-06-01', cancelNoticeDays: 30,
  });
  assert.equal(r.eligible, false);
});

// --- Denied boarding ---

test('8. Denied boarding from EU to GB — UK261 takes precedence', () => {
  const r = checkEligibility({
    depIata: 'FCO', arrIata: 'LHR', airlineCountry: 'IT',
    eventType: 'DENIED_BOARDING', flightDate: '2024-05-15',
  });
  assert.equal(r.eligible, true);
  if (r.eligible) {
    assert.equal(r.jurisdiction, 'UK261');
  }
});

// --- UK261 ---

test('9. UK261 for GB departure', () => {
  const r = checkEligibility({
    depIata: 'LHR', arrIata: 'CDG', airlineCountry: 'GB',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 4,
  });
  assert.equal(r.eligible, true);
  if (r.eligible) {
    assert.equal(r.jurisdiction, 'UK261');
    assert.equal(r.currency, 'GBP');
    assert.equal(r.amount, 220);
  }
});

test('10. UK261 — EU to GB arrival, UK261 takes precedence', () => {
  const r = checkEligibility({
    depIata: 'CDG', arrIata: 'LHR', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 4,
  });
  assert.equal(r.eligible, true);
  if (r.eligible) {
    assert.equal(r.jurisdiction, 'UK261');
  }
});

test('11. UK261 — long-haul from GB, £520', () => {
  const r = checkEligibility({
    depIata: 'LHR', arrIata: 'JFK', airlineCountry: 'GB',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 5,
  });
  assert.equal(r.eligible, true);
  if (r.eligible) {
    assert.equal(r.jurisdiction, 'UK261');
    assert.equal(r.amount, 520);
    assert.equal(r.currency, 'GBP');
  }
});

// --- Non-EU / Non-UK routes ---

test('12. Not eligible — non-EU to non-EU, US carrier', () => {
  const r = checkEligibility({
    depIata: 'JFK', arrIata: 'LAX', airlineCountry: 'US',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 10,
  });
  assert.equal(r.eligible, false);
});

test('13. Not eligible — non-EU to non-EU on EU carrier (no EU departure)', () => {
  const r = checkEligibility({
    depIata: 'JFK', arrIata: 'MIA', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 5,
  });
  assert.equal(r.eligible, false);
});

test('14. EU261 eligible — non-EU to EU on EU carrier', () => {
  const r = checkEligibility({
    depIata: 'JFK', arrIata: 'CDG', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 5,
  });
  assert.equal(r.eligible, true);
  if (r.eligible) {
    assert.equal(r.jurisdiction, 'EU261');
  }
});

// --- Edge cases: exact distance boundaries ---

test('15. Edge — exactly 3 hours delay on short-haul (threshold = 3h, should be eligible)', () => {
  const r = checkEligibility({
    depIata: 'CDG', arrIata: 'AMS', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2024-06-01', arrivalDelayHours: 3,
  });
  assert.equal(r.eligible, true);
});

test('16. Edge — exactly 0 delay hours (not eligible)', () => {
  const r = checkEligibility({
    depIata: 'CDG', arrIata: 'AMS', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2024-06-01', arrivalDelayHours: 0,
  });
  assert.equal(r.eligible, false);
});

// --- Time bar ---

test('17. Not eligible — claim too old (beyond time bar)', () => {
  const r = checkEligibility({
    depIata: 'CDG', arrIata: 'AMS', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2015-01-01', arrivalDelayHours: 5,
  });
  assert.equal(r.eligible, false);
  if (!r.eligible) {
    assert.ok(r.reason.includes('limit'));
  }
});

// --- Future flight ---

test('18. Not eligible — future flight date', () => {
  const r = checkEligibility({
    depIata: 'CDG', arrIata: 'JFK', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2099-01-01', arrivalDelayHours: 5,
  });
  assert.equal(r.eligible, false);
  if (!r.eligible) {
    assert.ok(r.reason.includes('future'));
  }
});

// --- Ticket type ---

test('19. Not eligible — free/staff ticket', () => {
  const r = checkEligibility({
    depIata: 'CDG', arrIata: 'JFK', airlineCountry: 'FR',
    eventType: 'DELAYED', flightDate: '2024-06-01', arrivalDelayHours: 5,
    ticketType: 'staff',
  });
  assert.equal(r.eligible, false);
});

// --- Unknown airport ---

test('20. Not eligible — unknown airport code', () => {
  const r = checkEligibility({
    depIata: 'XXX', arrIata: 'JFK', airlineCountry: 'US',
    eventType: 'DELAYED', flightDate: '2024-01-15', arrivalDelayHours: 5,
  });
  assert.equal(r.eligible, false);
  if (!r.eligible) {
    assert.ok(r.reason.includes('Unknown'));
  }
});
