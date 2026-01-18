import { NextResponse } from "next/server";
import { converge } from "@bickford/execution-convergence";
import { writeThread } from "@/lib/ledger/fs-ledger";

export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json();
  const threadId = crypto.randomUUID();

  const encoder = new TextEncoder();
  let partial: any[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: any) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      send("thread", { threadId });

      for (const agent of body.agents) {
        send("agent:start", { agentId: agent.id });

        // Simulated token streaming per agent
        const content = body.outputs
          .filter((o: any) => o.agentId === agent.id)
          .map((o: any) => o.content)
          .join(" ");

        for (const token of content.split(" ")) {
          send("agent:token", { agentId: agent.id, token });
          await new Promise(r => setTimeout(r, 15));
        }

        partial.push({
          agentId: agent.id,
          content
        });

        send("agent:end", { agentId: agent.id });
      }

      const result = converge({
        ...body,
        metadata: {
          timestamp: new Date().toISOString(),
          initiatedBy: "human"
        }
      });

      writeThread(threadId, {
        input: body,
        partial,
        result,
        persistedAt: new Date().toISOString()
      });

      send("final", result);
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
