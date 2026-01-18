import { NextRequest } from "next/server";

export const runtime = "edge";

function encode(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const agents = body.agents ?? [];

      for (const agent of agents) {
        controller.enqueue(
          encode({
            type: "agent-start",
            agentId: agent.id,
            role: agent.role
          })
        );

        const tokens = agent.message.split(" ");
        for (const t of tokens) {
          controller.enqueue(
            encode({
              type: "token",
              agentId: agent.id,
              value: t + " "
            })
          );
          await new Promise(r => setTimeout(r, 40));
        }

        controller.enqueue(
          encode({
            type: "agent-end",
            agentId: agent.id
          })
        );
      }

      controller.enqueue(encode({ type: "done" }));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
