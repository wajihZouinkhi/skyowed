import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function buildPdf(text: string, opts: { title?: string } = {}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(opts.title ?? 'SkyOwed demand letter');
  doc.setCreator('SkyOwed');
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const margin = 56;
  const fontSize = 11;
  const lineHeight = 14;
  const maxWidth = width - margin * 2;

  const wrap = (line: string): string[] => {
    const words = line.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth) {
        if (cur) lines.push(cur);
        cur = w;
      } else cur = test;
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  };

  let y = height - margin;
  for (const raw of text.split('\n')) {
    for (const ln of wrap(raw)) {
      if (y < margin) { y = height - margin; doc.addPage([595.28, 841.89]); }
      page.drawText(ln, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }
  }
  return await doc.save();
}
