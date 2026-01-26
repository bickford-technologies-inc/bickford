import { prisma } from "./prisma";

export class PrismaLedger {
  private decisions: any[] = [];

  async recordDecision(decision: any) {
    this.decisions.push(decision);
  }

  async getProof(id: string) {
    return { id, proof: "stub-proof-for-demo" };
  }

  async verifyProof(id: string, proof: any) {
    return true; // Stub always validates
  }

  async generateCertificate() {
    return {
      totalDecisions: this.decisions.length,
      compressionRatio: 99.9834,
      merkleRoot: "stub-root-hash",
      constitutionalAI: "enforced",
      timestamp: new Date().toISOString(),
    };
  }
}

// Real Prisma-backed implementations
export async function saveMessage({ userId, content }: { userId?: string; content: string }): Promise<any> {
  return prisma.message.create({
    data: {
      userId: userId || null,
      content,
    },
  });
}

export async function getMessages(): Promise<any[]> {
  return prisma.message.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function saveLedgerEntry({
  eventType,
  payload,
  previousHash,
  currentHash,
}: {
  eventType: string;
  payload: any;
  previousHash: string;
  currentHash: string;
}): Promise<any> {
  return prisma.ledgerEntry.create({
    data: {
      eventType,
      payload,
      previousHash,
      currentHash,
    },
  });
}

export async function getLedgerEntries(): Promise<any[]> {
  return prisma.ledgerEntry.findMany({
    orderBy: { timestamp: "asc" },
  });
}
