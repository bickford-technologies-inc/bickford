export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { text } = await req.json();
  const prisma = prisma;

  const msg = await prisma.chatMessage.create({
    data: {
      author: "USER",
      text,
      resolution: "CAPTURED",
    },
  });

  return Response.json(msg);
}
