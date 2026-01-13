import { prisma } from "@bickford/ledger";

export async function POST(req: Request) {
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
