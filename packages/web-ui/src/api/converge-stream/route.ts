import { converge } from "@bickford/execution-convergence";
import { persist } from "@bickford/ledger";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(
          encoder.encode(
            `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
          )
        );
      };

      send("status", { phase: "received" });

      body.outputs.forEach((o: any) => {
        send("agent", { agentId: o.agentId, content: o.content });
      });

      const result = converge({
        ...body,
        metadata: {
          timestamp: new Date().toISOString(),
          initiatedBy: "human"
        }
      });

      persist({
        status: result.status,
        payload: result
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
