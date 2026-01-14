export const runtime = "nodejs";

import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const prisma = getPrisma();
  const { text } = await req.json();

  const msg = await prisma.chatMessage.create({
    data: {
      author: "USER",
      text,
      resolution: "CAPTURED",
    },
  });

  return Response.json(msg);
}
