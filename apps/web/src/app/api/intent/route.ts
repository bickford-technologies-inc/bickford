import { getPrisma } from "@bickford/db";

export async function POST(req: Request) {
  const prisma = getPrisma();
  const { chatMessageId } = await req.json();

  const msg = await prisma.chatMessage.findUniqueOrThrow({
    where: { id: chatMessageId },
  });

  // TODO: plug real intent parser
  const intentType = "CHANGE";

  const intent = await prisma.intent.create({
    data: {
      sourceMessageId: msg.id,
      intentType,
      goal: msg.text,
      constraints: [],
      admissibility: "ALLOWED",
    },
  });

  await prisma.chatMessage.update({
    where: { id: msg.id },
    data: { intentId: intent.id },
  });

  return Response.json(intent);
}
