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

let sseClients: ReadableStreamDefaultController[] = [];
let wsClients: ServerWebSocket<unknown>[] = [];

function broadcastLedgerEntry(entry: LedgerEntry): void {
  const data = `data: ${JSON.stringify(entry)}\n\n`;
  sseClients.forEach((controller) => {
    try {
      controller.enqueue(data);
    } catch {
      process.exit(1);
    }
  });
  wsClients.forEach((ws) => {
    try {
      ws.send(JSON.stringify(entry));
    } catch {
      process.exit(1);
    }
  });
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
    process.exit(1);
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
      const entry = await getLatestLedgerEntry();
      return entry
        ? Response.json(entry)
        : new Response("No ledger entries yet", { status: 404 });
    }
    if (url.pathname === "/api/ledger/stream") {
      const file = Bun.file(ledgerPath);
      const text = await file.text();
      return Response.json(
        text
          .split("\n")
          .filter(Boolean)
          .map((line) => JSON.parse(line)),
      );
    }
    if (url.pathname === "/api/ledger/sse") {
      const headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      };
      let controllerRef: ReadableStreamDefaultController;
      const stream = new ReadableStream({
        start(controller) {
          controllerRef = controller;
          sseClients.push(controller);
          getLatestLedgerEntry().then((entry) => {
            if (entry) controller.enqueue(`data: ${JSON.stringify(entry)}\n\n`);
          });
        },
        cancel() {
          sseClients = sseClients.filter((c) => c !== controllerRef);
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
      wsClients.push(ws);
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
