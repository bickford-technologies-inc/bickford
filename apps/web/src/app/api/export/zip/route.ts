import JSZip from "jszip";
import { allCanon } from "@/lib/bickford/canon";
import { all as ledger } from "@/lib/bickford/ledger";
import { MOAT_TEXT } from "@/lib/bickford/moat";

export const runtime = "nodejs";

export async function GET() {
  const zip = new JSZip();

  zip.file(
    "README.txt",
    `
BICKFORD — ACQUISITION DATA ROOM

This archive contains:
- canon.json: immutable promoted rules
- ledger.json: append-only execution history
- moat.txt: compounding intelligence math
- proofs.txt: enforcement guarantees

Claude is advisory only.
Bickford enforces execution and memory.
`.trim()
  );

  zip.file("canon.json", JSON.stringify(allCanon(), null, 2));
  zip.file("ledger.json", JSON.stringify(ledger(), null, 2));
  zip.file("moat.txt", MOAT_TEXT);

  zip.file(
    "proofs.txt",
    `
ENFORCEMENT GUARANTEES

• Canon promotion requires ΔTTV < 0
• Non-interference enforced:
  ΔE[TTV_j | π_i] ≤ 0
• Canon is immutable
• Ledger is append-only
• No probabilistic memory
• No model fine-tuning

This system compounds structurally.
`.trim()
  );

  const blob = await zip.generateAsync({ type: "nodebuffer" });

  return new Response(blob, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition":
        'attachment; filename="bickford-anthropic-data-room.zip"',
    },
  });
}
