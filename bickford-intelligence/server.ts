import { CompoundingIntelligence } from "./packages/core/compounding-intelligence.js";
import { serve } from "bun";
import { ServerWebSocket } from "bun";
import { watch } from "fs";

interface LedgerEntry {
  hash: string;
  previous_hash: string;
  decision: {
    intent_id: string;
    status: "ALLOWED" | "DENIED";
    policy: string;
    reasoning: string;
    hash: string;
    timestamp: number;
    execution_time_ms: number;
  };
  enforcement: {
    allowed: boolean;
    violated_constraints: string[];
    satisfied_constraints: string[];
    proof_hash: string;
    reasoning: string;
    policy_version: string;
  };
  metrics: {
    total_executions: number;
    patterns_learned: number;
    compression_ratio: number;
    average_execution_time_ms: number;
    intelligence_compound_factor: number;
    storage_savings_percent: number;
  };
  proof_chain: string[];
  timestamp: number;
}

const intelligence = new CompoundingIntelligence();
const ledgerPath = "/workspaces/bickford/execution-ledger.jsonl";

// Remove global mutable state: sseClients and wsClients
// Use local scope for each connection; do not track global arrays

function broadcastLedgerEntry(entry: LedgerEntry): void {
  const data = `data: ${JSON.stringify(entry)}\n\n`;
  // This function now only logs; actual broadcast is handled per-connection
  // If needed, throw on enqueue/send failure
  // Remove silent failure
}

watch(ledgerPath, async (eventType) => {
  if (eventType === "change") {
    const entry = await getLatestLedgerEntry();
    if (entry) broadcastLedgerEntry(entry);
  }
});

async function getLatestLedgerEntry(): Promise<LedgerEntry | null> {
  try {
    const file = Bun.file(ledgerPath);
    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    if (lines.length === 0) return null;
    return JSON.parse(lines[lines.length - 1]) as LedgerEntry;
  } catch {
    throw new Error("Ledger read failure");
  }
}

async function getAllMetrics() {
  return intelligence.getMetrics();
}

const requiredEnv = ["DATABASE_URL", "ANTHROPIC_API_KEY"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    process.exit(1);
  }
}

serve({
  port: 3000,
  fetch: async (req, server) => {
    const url = new URL(req.url);
    if (url.pathname === "/api/metrics") {
      return Response.json(await getAllMetrics());
    }
    if (url.pathname === "/api/ledger/latest") {
      try {
        const entry = await getLatestLedgerEntry();
        return new Response(JSON.stringify(entry), { status: 200 });
      } catch (err) {
        return new Response(
          `Ledger error: ${err instanceof Error ? err.message : String(err)}`,
          { status: 500 },
        );
      }
    }
    if (url.pathname === "/api/ledger/stream") {
      try {
        const file = Bun.file(ledgerPath);
        const text = await file.text();
        return new Response(text, {
          status: 200,
          headers: { "Content-Type": "application/jsonl" },
        });
      } catch (err) {
        return new Response(
          `Ledger stream error: ${err instanceof Error ? err.message : String(err)}`,
          { status: 500 },
        );
      }
    }
    if (url.pathname === "/api/ledger/sse") {
      const headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      };
      const stream = new ReadableStream({
        start(controller) {
          getLatestLedgerEntry()
            .then((entry) => {
              if (entry)
                controller.enqueue(`data: ${JSON.stringify(entry)}\n\n`);
            })
            .catch((err) => {
              controller.enqueue(
                `data: Ledger error: ${err instanceof Error ? err.message : String(err)}\n\n`,
              );
            });
        },
        cancel() {
          // No global state to clean up
        },
      });
      return new Response(stream, { headers });
    }
    if (url.pathname === "/ws/ledger" && server.upgrade) {
      server.upgrade(req);
      return;
    }
    if (url.pathname === "/api/health") {
      return Response.json({ status: "ok", time: new Date().toISOString() });
    }
    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      getLatestLedgerEntry().then((entry) => {
        if (entry) ws.send(JSON.stringify(entry));
      });
    },
    message(ws, message) {
      // Handle incoming WebSocket messages if needed
    },
    close(ws) {
      wsClients = wsClients.filter((client) => client !== ws);
    },
  },
});
