import { NextRequest, NextResponse } from 'next/server';
import { renderLetter, type ClaimInput } from '@/lib/letter';
import { renderLetterFR } from '@/lib/letter.fr';
import { renderLetterDE } from '@/lib/letter.de';
import { renderLetterES } from '@/lib/letter.es';
import { buildPdf } from '@/lib/pdf';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ClaimInput & { locale?: string };
  const locale = body.locale ?? 'en';
  const text =
    locale === 'fr' ? renderLetterFR(body) :
    locale === 'de' ? renderLetterDE(body) :
    locale === 'es' ? renderLetterES(body) :
    renderLetter(body);
  const pdf = await buildPdf(text, { title: `Claim ${body.flightNumber}` });
  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=skyowed-${body.flightNumber}.pdf`,
    },
  });
}
