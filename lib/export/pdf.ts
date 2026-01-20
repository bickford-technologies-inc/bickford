import { PDFDocument, StandardFonts } from "pdf-lib";

export async function exportPDF(events: any[]) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Courier);

  let page = pdf.addPage();
  let y = page.getHeight() - 40;

  for (const event of events) {
    const line = JSON.stringify(event);
    if (y < 40) {
      page = pdf.addPage();
      y = page.getHeight() - 40;
    }
    page.drawText(line, { x: 40, y, font, size: 8 });
    y -= 12;
  }

  return pdf.save();
}
