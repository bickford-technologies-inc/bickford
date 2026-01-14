import { NextResponse } from "next/server";
// Canonical domain removed: UI surface only
import { all as history } from "@/lib/bickford/ui-data";
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

  doc.fontSize(16).text("Immutable Rules", { underline: true });
  doc.fontSize(10).text("(rules hidden: UI surface only)");
  doc.moveDown();

  doc.fontSize(16).text("History (Append-Only Execution)", { underline: true });
  doc.fontSize(10).text(JSON.stringify(history(), null, 2));
  doc.moveDown();

  doc.fontSize(16).text("Mathematics: Compounding Law", { underline: true });
  doc.fontSize(10).text(MOAT_TEXT);
  doc.moveDown();

  doc.fontSize(16).text("Enforcement Proofs", { underline: true });
  doc
    .fontSize(10)
    .text(
      "• Promotion requires ΔTTV < 0\n" +
        "• Non-interference enforced: ΔE[TTV_j | π_i] ≤ 0\n" +
        "• Rules are immutable\n" +
        "• Ledger is append-only\n" +
        "• No probabilistic memory\n" +
        "• No model fine-tuning\n"
    );
  doc.moveDown();

  doc.fontSize(16).text("Diligence Notes", { underline: true });
  doc
    .fontSize(10)
    .text(
      "Rules grow monotonically.\n" +
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
