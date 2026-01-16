import PDFDocument from "pdfkit"
import fs from "fs"

export function renderPDF(
  title: string,
  body: string,
  out: string
) {
  const doc = new PDFDocument({ margin: 50 })
  doc.pipe(fs.createWriteStream(out))
  doc.fontSize(16).text(title)
  doc.moveDown()
  doc.fontSize(10).text(body)
  doc.end()
}
