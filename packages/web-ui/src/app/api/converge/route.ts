import { converge } from "@bickford/execution-convergence";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const result = converge({
        ...body,
        metadata: {
          timestamp: new Date().toISOString(),
          initiatedBy: "human",
        },
      });

      const text = JSON.stringify(result, null, 2);

      for (const char of text) {
        controller.enqueue(new TextEncoder().encode(char));
        await new Promise((r) => setTimeout(r, 6)); // streaming cadence
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
