import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  // Should not throw type error if client is correct
  const msg = await prisma.chatMessage.findMany();
  console.log(msg);
}

test().catch(console.error);
