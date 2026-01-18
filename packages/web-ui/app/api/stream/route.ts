import { NextRequest } from "next/server";
import { appendLedger } from "@bickford/ledger";
import crypto from "node:crypto";

export const runtime = "nodejs";

function encode(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const threadId = body.threadId ?? crypto.randomUUID();

  appendLedger(threadId, {
    id: crypto.randomUUID(),
    threadId,
    role: "system",
    content: JSON.stringify({
      timestamp: new Date().toISOString(),
      type: "STREAM_START",
      payload: body,
    }),
    ts: Date.now(),
    intent: undefined,
    decision: undefined,
  });

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

      appendLedger(threadId, {
        id: crypto.randomUUID(),
        threadId,
        role: "system",
        content: JSON.stringify({
          timestamp: new Date().toISOString(),
          type: "STREAM_END",
          payload: { agents: body.agents?.map((a: any) => a.id) },
        }),
        ts: Date.now(),
        intent: undefined,
        decision: undefined,
      });
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
