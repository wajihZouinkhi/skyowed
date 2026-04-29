export interface Airline {
  iata: string;
  icao: string;
  name: string;
  country: string;
  claimsEmail: string;
  postalAddress: string;
  slaDays: number;
}

export const AIRLINES: Airline[] = [
  { iata: 'AF', icao: 'AFR', name: 'Air France', country: 'FR',
    claimsEmail: 'mail.clientelle.af@airfrance.fr',
    postalAddress: 'Air France — Service Clientèle, 95747 Roissy CDG Cedex, France',
    slaDays: 60 },
  { iata: 'LH', icao: 'DLH', name: 'Lufthansa', country: 'DE',
    claimsEmail: 'customer.relations@lufthansa.com',
    postalAddress: 'Deutsche Lufthansa AG, Kundendialog, 33048 Paderborn, Germany',
    slaDays: 60 },
  { iata: 'BA', icao: 'BAW', name: 'British Airways', country: 'GB',
    claimsEmail: 'eu.compensation@ba.com',
    postalAddress: 'British Airways Customer Relations, PO Box 1126, Uxbridge UB8 9XS, UK',
    slaDays: 56 },
  { iata: 'IB', icao: 'IBE', name: 'Iberia', country: 'ES',
    claimsEmail: 'customer.relations@iberia.com',
    postalAddress: 'Iberia L.A.E. — Servicio de Atención al Cliente, C/ Martínez Villergas 49, 28027 Madrid, Spain',
    slaDays: 60 },
  { iata: 'FR', icao: 'RYR', name: 'Ryanair', country: 'IE',
    claimsEmail: 'eu261@ryanair.com',
    postalAddress: 'Ryanair DAC, Airside Business Park, Swords, Co. Dublin, Ireland',
    slaDays: 28 },
  { iata: 'U2', icao: 'EZY', name: 'easyJet', country: 'GB',
    claimsEmail: 'eu261claims@easyjet.com',
    postalAddress: 'easyJet Airline Co. Ltd, Hangar 89, London Luton Airport LU2 9PF, UK',
    slaDays: 28 },
  { iata: 'VY', icao: 'VLG', name: 'Vueling', country: 'ES',
    claimsEmail: 'customer@vueling.com',
    postalAddress: 'Vueling Airlines S.A., Parc de Negocis Mas Blau II, 08820 El Prat de Llobregat, Spain',
    slaDays: 30 },
  { iata: 'KL', icao: 'KLM', name: 'KLM', country: 'NL',
    claimsEmail: 'klm.eu.compensation@klm.com',
    postalAddress: 'KLM Customer Care, PO Box 7700, 1117 ZL Schiphol, Netherlands',
    slaDays: 60 },
];

export function findAirline(iata: string): Airline | undefined {
  return AIRLINES.find(a => a.iata.toUpperCase() === iata.toUpperCase());
}

export function searchAirlines(q: string): Airline[] {
  const s = q.trim().toLowerCase();
  if (!s) return AIRLINES;
  return AIRLINES.filter(a =>
    a.iata.toLowerCase().includes(s) ||
    a.name.toLowerCase().includes(s) ||
    a.country.toLowerCase().includes(s)
  );
}
