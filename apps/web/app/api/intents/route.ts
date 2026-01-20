import intents from "../../../data/intents.cio.json";

export async function GET() {
  return Response.json(intents);
}

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({
    id: crypto.randomUUID(),
    type: "INTENT_CREATED",
    title: body?.text ?? "",
    createdAt: new Date().toISOString(),
    source: "chat-dock",
  });
}
