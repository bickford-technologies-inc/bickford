import { authorize } from "@bickford/authority";
import { appendLedger } from "@bickford/ledger";
import { evaluateNonInterference } from "@bickford/optr";
import { prisma } from "@bickford/ledger/db";

export async function POST(req: Request) {
  try {
    const intent = await req.json();

    // Validate intent structure
    if (!intent || typeof intent !== 'object') {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate origin is provided
    if (!intent.origin || typeof intent.origin !== 'string') {
      return Response.json(
        { error: "Missing or invalid 'origin' field in intent" },
        { status: 400 }
      );
    }

    // Get actor state
    const actor = await prisma.agentState.findUnique({
      where: { agentId: intent.origin },
    });

    // Get all other agents
    const others = await prisma.agentState.findMany({
      where: { agentId: { not: intent.origin } },
    });

    // Simulated projection (baseline: no change)
    // Replace with real estimator in future upgrade
    const projectedTTV: Record<string, number> = {};
    for (const a of others) {
      projectedTTV[a.agentId] = a.ttvBaseline;
    }

    // Non-interference check (runs BEFORE canon authorization)
    const interference = evaluateNonInterference(
      { agentId: intent.origin, ttvBaseline: actor?.ttvBaseline ?? 0 },
      others.map(o => ({
        agentId: o.agentId,
        ttvBaseline: o.ttvBaseline,
      })),
      projectedTTV
    );

    if (!interference.allowed) {
      const denial = {
        outcome: "DENY" as const,
        allowed: false,
        canonId: "NON-INTERFERENCE",
        rationale: interference.rationale,
        violatedAgent: interference.violatedAgent,
        deltaTTV: interference.deltaTTV,
        timestamp: new Date().toISOString(),
      };

      const ledgerEntry = await appendLedger(intent, denial);
      return Response.json({ decision: denial, ledgerEntry });
    }

    // Canon authorization (second gate)
    const decision = authorize(intent);
    const ledgerEntry = await appendLedger(intent, decision);

    return Response.json({ decision, ledgerEntry });
  } catch (error) {
    console.error("Error in /api/execute:", error);
    return Response.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
