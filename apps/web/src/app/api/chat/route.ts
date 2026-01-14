import Anthropic from "@anthropic-ai/sdk";
import { BICKFORD_SYSTEM_PROMPT } from "@/lib/claude/system";
import { persistDecision } from "@/lib/bickford/persisted-knowledge";

export const runtime = "nodejs"; // 🔒 force Node runtime (required)

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  const { input } = await req.json();

  const encoder = new TextEncoder();

  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      const messageStream = await claude.messages.stream({
        model: "claude-3-5-sonnet-20240620",
        system: BICKFORD_SYSTEM_PROMPT,
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: input,
          },
        ],
      });

      try {
        for await (const event of messageStream) {
          if (event.type === "content_block_delta") {
            if (event.delta.type === "text_delta") {
              fullText += event.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${event.delta.text}\n\n`)
              );
            }
          }
        }

        // 🔒 Persist structurally AFTER stream completes
        await persistDecision({
          intent: input,
          proposal: fullText,
          executed: false,
          ttvDelta: null,
        });

        controller.enqueue(
          encoder.encode(`event: done\ndata: [STREAM_COMPLETE]\n\n`)
        );
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${String(err)}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
