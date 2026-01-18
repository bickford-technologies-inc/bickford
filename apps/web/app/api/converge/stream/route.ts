import { converge } from "@bickford/execution-convergence";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 1️⃣ announce start
      controller.enqueue(
        encoder.encode(
          sse({ type: "meta", status: "STREAM_START" })
        )
      );

      // 2️⃣ stream agent outputs as they arrive
      for (const agent of body.agents ?? []) {
        controller.enqueue(
          encoder.encode(
            sse({
              type: "agent",
              agentId: agent.id,
              role: agent.role,
              status: "ACTIVE"
            })
          )
        );
      }

      // 3️⃣ final convergence
      const result = converge({
        ...body,
        metadata: {
          timestamp: new Date().toISOString(),
          initiatedBy: "human"
        }
      });

      controller.enqueue(
        encoder.encode(
          sse({
            type: "final",
            result
          })
        )
      );

      controller.enqueue(
        encoder.encode(
          sse({ type: "meta", status: "STREAM_END" })
        )
      );

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
