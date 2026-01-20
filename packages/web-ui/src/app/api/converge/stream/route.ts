import { converge } from "@bickford/execution-convergence";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(type: string, payload: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`)
        );
      }

      send("status", { phase: "received" });

      send("status", { phase: "converging" });
      const result = converge({
        ...body,
        metadata: {
          timestamp: new Date().toISOString(),
          initiatedBy: "human"
        }
      });

      send("result", result);
      send("done", {});
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
