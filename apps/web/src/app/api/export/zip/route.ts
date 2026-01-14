import JSZip from "jszip";
// Canonical domain removed: UI surface only
import { all as history } from "@/lib/bickford/ui-data";
import { MOAT_TEXT } from "@/lib/bickford/moat";

export const runtime = "nodejs";

export async function GET() {
  const zip = new JSZip();

  zip.file(
    "README.txt",
    `
BICKFORD — ACQUISITION DATA ROOM

This archive contains:
- rules.json: immutable promoted rules (UI surface only)
- history.json: append-only execution history
- moat.txt: compounding intelligence math
- proofs.txt: enforcement guarantees

Claude is advisory only.
Bickford enforces execution and memory.
`.trim()
  );

  zip.file("rules.json", JSON.stringify([], null, 2));
  zip.file("history.json", JSON.stringify(history(), null, 2));
  zip.file("moat.txt", MOAT_TEXT);

  zip.file(
    "proofs.txt",
    `
ENFORCEMENT GUARANTEES

• Promotion requires ΔTTV < 0
• Non-interference enforced:
  ΔE[TTV_j | π_i] ≤ 0
• Rules are immutable
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
