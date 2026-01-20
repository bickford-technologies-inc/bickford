import { Request } from "next/server";
import { appendLedger } from "@bickford/ledger";
import { LedgerEntry } from "@bickford/types";
import crypto from "node:crypto";

export const runtime = "nodejs";

function encode(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const threadId = body.threadId ?? crypto.randomUUID();

  const startEntry: LedgerEntry = {
    id: crypto.randomUUID(),
    event: {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    },
  };

  appendLedger(threadId, startEntry);

  const stream = new ReadableStream({
    async start(controller) {
      for (const agent of body.agents ?? []) {
        controller.enqueue(
          encode({ type: "agent-start", agentId: agent.id, role: agent.role }),
        );

        const tokens = agent.message.split(" ");
        for (const t of tokens) {
          controller.enqueue(
            encode({ type: "token", agentId: agent.id, value: t + " " }),
          );
          await new Promise((r) => setTimeout(r, 30));
        }

        controller.enqueue(encode({ type: "agent-end", agentId: agent.id }));
      }

      controller.enqueue(encode({ type: "done" }));
      controller.close();

      const endEntry: LedgerEntry = {
        id: crypto.randomUUID(),
        event: {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        },
      };

      appendLedger(threadId, endEntry);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
