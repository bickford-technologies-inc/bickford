// Canonical domain removed: UI surface only
import { all as history } from "@/lib/bickford/ui-data";
import { MOAT_TEXT } from "@/lib/bickford/moat";

export async function GET() {
  return Response.json({
    meta: {
      system: "Bickford",
      purpose: "Decision Continuity Runtime",
      generatedAt: new Date().toISOString(),
    },

    executive_summary: {
      thesis:
        "Bickford converts safe reasoning into deterministic execution and permanent institutional memory.",
      moat: "Compounding structural intelligence with zero model drift.",
    },

    rules: {
      description:
        "Immutable rules promoted only under ΔTTV improvement and non-interference.",
      rules: [], // UI surface only
    },

    history: {
      description: "Append-only execution history. No deletion. No mutation.",
      entries: history(),
    },

    mathematics: MOAT_TEXT,

    enforcement: {
      non_interference: "ΔE[TTV_j | π_i] ≤ 0 enforced at promotion time.",
      execution: "Claude advisory only. Bickford executes.",
    },

    diligence_notes: [
      "Rules grow monotonically.",
      "No probabilistic memory.",
      "No retraining required.",
      "Institutional memory compounds with every deployment.",
    ],
  });
}
