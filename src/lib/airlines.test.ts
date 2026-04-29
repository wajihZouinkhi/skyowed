import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findAirline, searchAirlines, AIRLINES } from './airlines';

test('findAirline by IATA is case-insensitive', () => {
  assert.equal(findAirline('af')?.name, 'Air France');
  assert.equal(findAirline('BA')?.country, 'GB');
});

test('searchAirlines matches partial name', () => {
  const hits = searchAirlines('lufth');
  assert.ok(hits.some(a => a.iata === 'LH'));
});

test('every airline has a claims email', () => {
  for (const a of AIRLINES) assert.match(a.claimsEmail, /@/);
});
