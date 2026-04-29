import { NextRequest, NextResponse } from 'next/server';
import { buildLetter, renderLetter, type LetterInput } from '@/lib/letter';
import { renderLetterFR } from '@/lib/letter.fr';
import { renderLetterDE } from '@/lib/letter.de';
import { renderLetterES } from '@/lib/letter.es';
import { buildPdf } from '@/lib/pdf';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as LetterInput & { locale?: string };
  const locale = body.locale ?? 'en';
  const text =
    locale === 'fr' ? renderLetterFR(body as unknown as import('@/lib/letter').ClaimInput) :
    locale === 'de' ? renderLetterDE(body as unknown as import('@/lib/letter').ClaimInput) :
    locale === 'es' ? renderLetterES(body as unknown as import('@/lib/letter').ClaimInput) :
    renderLetter(body);
  const pdf = await buildPdf(text, { title: `Claim ${body.flightNumber}` });
  return new NextResponse(Buffer.from(pdf) as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=skyowed-${body.flightNumber}.pdf`,
    },
  });
}
