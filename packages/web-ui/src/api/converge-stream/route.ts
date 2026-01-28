import { converge } from "@bickford/execution-convergence";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      send("status", { phase: "received" });

      body.outputs.forEach((o: any) => {
        send("agent", { agentId: o.agentId, content: o.content });
      });

      const result = await converge({
        ...body,
        metadata: {
          timestamp: new Date().toISOString(),
          initiatedBy: "human",
        },
      });

      send("final", result);
      controller.close();
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
