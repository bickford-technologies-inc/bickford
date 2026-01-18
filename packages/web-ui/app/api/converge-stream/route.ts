import { converge } from "@bickford/execution-convergence";

export async function POST(req: Request) {
  const body = await req.text();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(
            `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
          )
        );
      }

      // --- AGENT: AUTHORITY (streaming plan) ---
      send("agent", { agent: "authority", token: "Analyzing intent…" });
      await delay(400);

      send("agent", { agent: "authority", token: "Building executable plan…" });
      await delay(400);

      // --- FINAL CONVERGENCE ---
      const result = converge({
        mode: "EXECUTION",
        agents: [
          { id: "auth", role: "EXECUTION_AUTHORITY", provider: "bickford" },
          { id: "audit", role: "CONSTRAINT_AUDITOR", provider: "bickford" }
        ],
        outputs: [
          {
            agentId: "auth",
            content: [{ id: "step-1", action: "deploy" }]
          },
          {
            agentId: "audit",
            content: "ok",
            constraints: []
          }
        ],
        metadata: {
          timestamp: new Date().toISOString(),
          initiatedBy: "human"
        }
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

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
