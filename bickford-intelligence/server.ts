import { CompoundingIntelligence } from "./packages/core/compounding-intelligence";
import { serve } from "bun";

const intelligence = new CompoundingIntelligence();
const ledgerPath = "/workspaces/bickford/execution-ledger.jsonl";

let sseClients: ReadableStreamDefaultController[] = [];
let wsClients: ServerWebSocket<unknown>[] = [];

function broadcastLedgerEntry(entry: Record<string, unknown>) {
  // Broadcast to SSE clients
  const data = `data: ${JSON.stringify(entry)}\n\n`;
  sseClients.forEach((controller) => {
    try {
      controller.enqueue(data);
    } catch (err) {
      // Optionally log to a production logger
      process.exit(1);
    }
  });
  // Broadcast to WebSocket clients
  wsClients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(entry));
    }
  });
}

// Watch ledger file for changes and broadcast new entries
// Removed TODO: Replace with Bun-native file watching when available
// watch(ledgerPath, async (eventType) => {
//   if (eventType === "change") {
//     const entry = await getLatestLedgerEntry();
//     if (entry) broadcastLedgerEntry(entry);
//   }
// });

async function getLatestLedgerEntry(): Promise<Record<string, unknown> | null> {
  try {
    const file = Bun.file(ledgerPath);
    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    if (lines.length === 0) return null;
    return JSON.parse(lines[lines.length - 1]);
  } catch (err) {
    // Optionally log to a production logger
    process.exit(1);
  }
}

async function getAllMetrics(): Promise<Record<string, unknown>[]> {
  return intelligence.getMetrics();
}

// Environment variable validation (fail fast)
const requiredEnv = ["DATABASE_URL", "ANTHROPIC_API_KEY"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    // Optionally log to a production logger
    process.exit(1);
  }
}

serve({
  port: 3000,
  fetch: async (req, server) => {
    const url = new URL(req.url);
    if (url.pathname === "/api/metrics") {
      // Return current intelligence metrics
      return Response.json(await getAllMetrics());
    }
    if (url.pathname === "/api/ledger/latest") {
      // Return latest ledger entry
      const entry = await getLatestLedgerEntry();
      return entry
        ? Response.json(entry)
        : new Response("No ledger entries yet", { status: 404 });
    }
    if (url.pathname === "/api/ledger/stream") {
      // Simple polling stream (for demo)
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
      // SSE endpoint for live ledger updates (Bun-native streaming)
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
    // WebSocket upgrade
    if (url.pathname === "/ws/ledger" && server.upgrade) {
      server.upgrade(req);
      return;
    }
    // Health check
    if (url.pathname === "/api/health") {
      return Response.json({ status: "ok", time: new Date().toISOString() });
    }
    // Default: 404
    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      wsClients.push(ws);
      // Send latest entry immediately
      getLatestLedgerEntry().then((entry) => {
        if (entry) ws.send(JSON.stringify(entry));
      });
    },
    message(ws, message) {
      // Optionally handle client messages (e.g., filter, subscribe)
    },
    close(ws) {
      wsClients = wsClients.filter((client) => client !== ws);
    },
  },
});
