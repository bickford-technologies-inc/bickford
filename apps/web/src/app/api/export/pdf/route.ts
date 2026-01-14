import { NextResponse } from "next/server";
import { allCanon } from "@/lib/bickford/canon";
import { all as ledger } from "@/lib/bickford/ledger";
import { MOAT_TEXT } from "@/lib/bickford/moat";

// Use a pure JS PDF generator for Vercel Node runtime
import PDFDocument from "pdfkit";
import { Readable } from "stream";

export const runtime = "nodejs";

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export async function GET() {
  const doc = new PDFDocument({ margin: 40 });
  const stream = doc.pipe(new Readable({ read() {} }));

  doc
    .fontSize(22)
    .text("BICKFORD — ACQUISITION DATA ROOM", { align: "center" });
  doc.moveDown();
  doc
    .fontSize(14)
    .text("System: Bickford", { continued: true })
    .text("    Generated: " + new Date().toISOString());
  doc.moveDown();

  doc.fontSize(16).text("Executive Summary", { underline: true });
  doc
    .fontSize(12)
    .text(
      "Bickford converts safe reasoning into deterministic execution and permanent institutional memory.\n" +
        "Compounding structural intelligence with zero model drift.\n"
    );
  doc.moveDown();

  doc.fontSize(16).text("Canon (Immutable Rules)", { underline: true });
  doc.fontSize(10).text(JSON.stringify(allCanon(), null, 2));
  doc.moveDown();

  doc
    .fontSize(16)
    .text("Ledger (Append-Only Execution History)", { underline: true });
  doc.fontSize(10).text(JSON.stringify(ledger(), null, 2));
  doc.moveDown();

  doc.fontSize(16).text("Mathematics: Compounding Law", { underline: true });
  doc.fontSize(10).text(MOAT_TEXT);
  doc.moveDown();

  doc.fontSize(16).text("Enforcement Proofs", { underline: true });
  doc
    .fontSize(10)
    .text(
      "• Canon promotion requires ΔTTV < 0\n" +
        "• Non-interference enforced: ΔE[TTV_j | π_i] ≤ 0\n" +
        "• Canon is immutable\n" +
        "• Ledger is append-only\n" +
        "• No probabilistic memory\n" +
        "• No model fine-tuning\n"
    );
  doc.moveDown();

  doc.fontSize(16).text("Diligence Notes", { underline: true });
  doc
    .fontSize(10)
    .text(
      "Canon grows monotonically.\n" +
        "No probabilistic memory.\n" +
        "No retraining required.\n" +
        "Institutional memory compounds with every deployment.\n"
    );
  doc.moveDown();

  doc.fontSize(16).text("Appendix: Term Sheet", { underline: true });
  doc
    .fontSize(10)
    .text(
      "This appendix is for diligence only.\n" +
        "All terms subject to negotiation.\n" +
        "Contact: founders@bickford.com\n\n" +
        "Sample Terms:\n" +
        "- Asset: Bickford Decision Continuity Runtime\n" +
        "- Scope: Source, IP, and institutional memory\n" +
        "- License: Perpetual, irrevocable\n" +
        "- Price: Negotiable\n" +
        "- Support: Transition and knowledge transfer included\n"
    );

  doc.end();
  const buffer = await streamToBuffer(stream);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="bickford-anthropic-data-room.pdf"',
    },
  });
}
