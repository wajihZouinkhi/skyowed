import type { ClaimInput } from './letter';

export function renderLetterES(input: ClaimInput): string {
  const { passenger, airline, flightNumber, departure, arrival, date, amount, basis } = input;
  const today = new Date().toISOString().slice(0, 10);
  return [
    passenger.fullName,
    passenger.address,
    '',
    today,
    '',
    airline.name,
    'Servicio de reclamaciones',
    airline.address,
    '',
    `Asunto: Reclamación de indemnización — ${basis} — Vuelo ${flightNumber} del ${date}`,
    '',
    'Estimados señores:',
    '',
    `Fui pasajero/a del vuelo ${flightNumber} operado por ${airline.name} el ${date}, con origen en ${departure} y destino ${arrival} (localizador: ${passenger.pnr}).`,
    '',
    `Conforme al ${basis === 'UK261' ? 'Reglamento UK261' : 'Reglamento (CE) n.º 261/2004'}, me corresponde una compensación de ${amount} EUR.`,
    '',
    `Solicito el abono de ${amount} EUR en un plazo de 14 días en la cuenta: ${passenger.iban}.`,
    '',
    'De no recibir respuesta, acudiré a la autoridad nacional competente y a los tribunales.',
    '',
    'Atentamente,',
    '',
    passenger.fullName,
    '',
    '— Adjuntos: tarjeta de embarque, confirmación de reserva.',
  ].join('\n');
}
