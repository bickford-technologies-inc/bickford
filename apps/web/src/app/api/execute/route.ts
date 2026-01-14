export const runtime = "nodejs";
export const maxDuration = 300;

import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const prisma = getPrisma();
  const { intentId } = await req.json();

  const intent = await prisma.intent.findUniqueOrThrow({
    where: { id: intentId },
  });

  if (intent.admissibility !== "ALLOWED") {
    throw new Error("Intent not admissible");
  }

  const exec = await prisma.execution.create({
    data: {
      intentId,
      status: "SUCCEEDED",
      artifacts: ["proof://placeholder"],
    },
  });

  await prisma.chatMessage.update({
    where: { id: intent.sourceMessageId },
    data: { resolution: "REALIZED" },
  });

  return Response.json(exec);
}
