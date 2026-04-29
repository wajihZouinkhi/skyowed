import type { ClaimInput } from './letter';

export function renderLetterFR(input: ClaimInput): string {
  const { passenger, airline, flightNumber, departure, arrival, date, amount, basis } = input;
  const today = new Date().toISOString().slice(0, 10);
  return [
    `${passenger.fullName}`,
    `${passenger.address}`,
    '',
    today,
    '',
    `${airline.name}`,
    `Service réclamations`,
    `${airline.address}`,
    '',
    `Objet : Demande d'indemnisation — ${basis} — Vol ${flightNumber} du ${date}`,
    '',
    'Madame, Monsieur,',
    '',
    `Je vous écris au sujet du vol ${flightNumber} opéré par ${airline.name} le ${date}, reliant ${departure} à ${arrival}, sur lequel j'étais passager(ère) (numéro de réservation : ${passenger.pnr}).`,
    '',
    `En vertu du règlement ${basis === 'UK261' ? 'UK261' : '(CE) n° 261/2004'}, ce vol ouvre droit à une indemnisation forfaitaire de ${amount} EUR.`,
    '',
    `Je vous prie de bien vouloir procéder au versement de ${amount} EUR sous 14 jours sur le compte suivant : ${passenger.iban}.`,
    '',
    'À défaut de règlement dans ce délai, je me réserve le droit de saisir l\'autorité nationale compétente ainsi que le tribunal judiciaire.',
    '',
    'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.',
    '',
    passenger.fullName,
    '',
    '— Pièces jointes : carte d\'embarquement, confirmation de réservation.',
  ].join('\n');
}
