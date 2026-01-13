import { prisma } from "./prisma";

export { prisma };

export type LedgerTx = typeof prisma;

export async function withLedgerTx<T>(
  fn: (tx: LedgerTx) => Promise<T>
): Promise<T> {
  return prisma.$transaction((tx: LedgerTx) => fn(tx));
}
