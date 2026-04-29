import { NextResponse } from 'next/server';
import { checkEligibility } from '@/lib/eligibility';
import { buildLetter, type LetterInput } from '@/lib/letter';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LetterInput & Parameters<typeof checkEligibility>[0];
    const result = checkEligibility(body);
    if (!result.eligible) return NextResponse.json({ error: result.reason }, { status: 422 });
    const text = buildLetter(body, result);
    return new NextResponse(text, {
      status: 200,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'content-disposition': `attachment; filename="skyowed-claim-${body.flightNumber}.txt"` },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Bad request' }, { status: 400 });
  }
}
