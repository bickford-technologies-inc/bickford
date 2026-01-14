export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      setInterval(() => {
        controller.enqueue(encoder.encode(`data: tick ${Date.now()}\n\n`));
      }, 1000);
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
