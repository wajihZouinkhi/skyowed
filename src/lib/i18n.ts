export type Locale = 'en' | 'fr' | 'de' | 'es';
export const LOCALES: Locale[] = ['en', 'fr', 'de', 'es'];
export const DEFAULT_LOCALE: Locale = 'en';

export const dict: Record<Locale, Record<string, string>> = {
  en: {
    'cta.check': 'Check my flight',
    'cta.pay': 'Get my letter (€6.99)',
    'status.draft': 'Draft',
    'status.letter_sent': 'Letter sent',
    'status.awaiting': 'Awaiting reply',
    'status.paid': 'Paid',
    'status.rejected': 'Rejected',
    'nav.dashboard': 'My claims',
  },
  fr: {
    'cta.check': 'Vérifier mon vol',
    'cta.pay': 'Obtenir ma lettre (6,99 €)',
    'status.draft': 'Brouillon',
    'status.letter_sent': 'Lettre envoyée',
    'status.awaiting': 'En attente de réponse',
    'status.paid': 'Indemnisé',
    'status.rejected': 'Refusé',
    'nav.dashboard': 'Mes dossiers',
  },
  de: {
    'cta.check': 'Flug prüfen',
    'cta.pay': 'Musterbrief holen (6,99 €)',
    'status.draft': 'Entwurf',
    'status.letter_sent': 'Brief gesendet',
    'status.awaiting': 'Wartet auf Antwort',
    'status.paid': 'Bezahlt',
    'status.rejected': 'Abgelehnt',
    'nav.dashboard': 'Meine Fälle',
  },
  es: {
    'cta.check': 'Comprobar mi vuelo',
    'cta.pay': 'Obtener mi carta (6,99 €)',
    'status.draft': 'Borrador',
    'status.letter_sent': 'Carta enviada',
    'status.awaiting': 'Esperando respuesta',
    'status.paid': 'Pagado',
    'status.rejected': 'Rechazado',
    'nav.dashboard': 'Mis reclamaciones',
  },
};

export function t(locale: Locale, key: string): string {
  return dict[locale]?.[key] ?? dict.en[key] ?? key;
}
