import { prisma } from "./db.js";

export async function recordDeployEvent(input: {
  id: string;
  buildId: string;
}) {
  return prisma.deployEvent.create({
    data: {
      id: input.id,
      buildId: input.buildId,
      createdAt: new Date(),
    },
  });
}
