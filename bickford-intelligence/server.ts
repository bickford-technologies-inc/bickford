import { CompoundingIntelligence } from "./packages/core/compounding-intelligence.js";
import { serve } from "bun";
import { ServerWebSocket } from "bun";
import { watch } from "fs";

const intelligence = new CompoundingIntelligence();
const ledgerPath = "/workspaces/bickford/execution-ledger.jsonl";

let sseClients: ReadableStreamDefaultController[] = [];
let wsClients: ServerWebSocket<any>[] = [];

function broadcastLedgerEntry(entry: any) {
  // Broadcast to SSE clients
  const data = `data: ${JSON.stringify(entry)}\n\n`;
  sseClients.forEach((controller) => {
    try {
      controller.enqueue(data);
    } catch {}
  });
  // Broadcast to WebSocket clients
  wsClients.forEach((ws) => {
    try {
      ws.send(JSON.stringify(entry));
    } catch {}
  });
}

// Watch ledger file for changes and broadcast new entries
watch(ledgerPath, async (eventType) => {
  if (eventType === "change") {
    const entry = await getLatestLedgerEntry();
    if (entry) broadcastLedgerEntry(entry);
  }
});

async function getLatestLedgerEntry() {
  try {
    const file = Bun.file(ledgerPath);
    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    if (lines.length === 0) return null;
    return JSON.parse(lines[lines.length - 1]);
  } catch (err) {
    return null;
  }
}

async function getAllMetrics() {
  return intelligence.getMetrics();
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

console.log(
  "Bickford Intelligence Monitoring Server running on http://localhost:3000",
);
console.log("Endpoints:");
console.log("  /api/metrics         - Current intelligence metrics");
console.log("  /api/ledger/latest   - Latest ledger entry");
console.log("  /api/ledger/stream   - All ledger entries (demo stream)");
console.log("  /api/ledger/sse      - SSE live ledger stream");
console.log("  /ws/ledger           - WebSocket live ledger stream");
console.log("  /api/health          - Health check");
