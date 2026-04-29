import type { ClaimInput } from './letter';

export function renderLetterDE(input: ClaimInput): string {
  const { passenger, airline, flightNumber, departure, arrival, date, amount, basis } = input;
  const today = new Date().toISOString().slice(0, 10);
  return [
    passenger.fullName,
    passenger.address,
    '',
    today,
    '',
    airline.name,
    'Kundenservice / Beschwerden',
    airline.address,
    '',
    `Betreff: Ausgleichsforderung — ${basis} — Flug ${flightNumber} vom ${date}`,
    '',
    'Sehr geehrte Damen und Herren,',
    '',
    `ich war Passagier(in) auf Flug ${flightNumber} von ${departure} nach ${arrival} am ${date} (Buchungsnummer: ${passenger.pnr}).`,
    '',
    `Gemäß ${basis === 'UK261' ? 'UK261' : 'Verordnung (EG) Nr. 261/2004'} steht mir eine Ausgleichszahlung in Höhe von ${amount} EUR zu.`,
    '',
    `Ich fordere Sie auf, diesen Betrag binnen 14 Tagen auf folgendes Konto zu überweisen: ${passenger.iban}.`,
    '',
    'Nach Fristablauf behalte ich mir rechtliche Schritte vor.',
    '',
    'Mit freundlichen Grüßen',
    '',
    passenger.fullName,
    '',
    '— Anlagen: Bordkarte, Buchungsbestätigung.',
  ].join('\n');
}
