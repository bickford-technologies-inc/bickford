import crypto from "crypto";
import { Intent, Decision, LedgerEntry, LedgerRow } from "@bickford/types";
import { prisma, assertNodeRuntime } from "./db";

// Ensure we're running in Node.js
assertNodeRuntime();

export async function appendLedger(
  intent: Intent,
  decision: Decision,
  tenantId?: string
): Promise<LedgerEntry> {
  const payload = JSON.stringify({ intent, decision });
  const hash = crypto.createHash("sha256").update(payload).digest("hex");

  const entry = await prisma.ledgerEntry.create({
    data: {
      id: crypto.randomUUID(),
      intent,
      decision,
      hash,
      tenantId: tenantId || null,
    },
  });

  return {
    id: entry.id,
    intent,
    decision,
    hash: entry.hash,
    createdAt: entry.createdAt.toISOString(),
    tenantId: entry.tenantId || undefined,
  };
}

export async function getLedger(tenantId?: string): Promise<LedgerEntry[]> {
  const rows = await prisma.ledgerEntry.findMany({
    where: tenantId ? { tenantId } : {},
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    intent: r.intent as Intent,
    decision: r.decision as Decision,
    hash: r.hash,
    createdAt: r.createdAt.toISOString(),
    tenantId: r.tenantId || undefined,
  }));
}

// Build event tracking
export async function recordBuildEvent(
  commitSha: string,
  branch: string,
  status: "success" | "failure" | "in_progress"
): Promise<{ id: string; ledgerHash: string | null }> {
  const id = crypto.randomUUID();
  
  const event = await prisma.buildEvent.create({
    data: {
      id,
      commitSha,
      branch,
      status,
      startedAt: new Date(),
      completedAt: status !== "in_progress" ? new Date() : null,
    },
  });

  // If successful, create ledger proof
  let ledgerHash: string | null = null;
  if (status === "success") {
    const ledgerEntry = await appendLedger(
      { action: "build", context: { commitSha, branch }, timestamp: new Date().toISOString() },
      { outcome: "ALLOW", reason: "Build succeeded", timestamp: new Date().toISOString() }
    );
    ledgerHash = ledgerEntry.hash;
    
    // Update build event with ledger hash
    await prisma.buildEvent.update({
      where: { id },
      data: { ledgerHash },
    });
  }

  return { id, ledgerHash };
}

// Deploy event tracking with mandatory ledger proof
export async function recordDeployEvent(
  commitSha: string,
  environment: "staging" | "production",
  status: "success" | "failure" | "rolled_back",
  buildId?: string
): Promise<{ id: string; ledgerHash: string }> {
  const id = crypto.randomUUID();

  // MANDATORY: Create ledger proof for deploy
  const ledgerEntry = await appendLedger(
    { 
      action: "deploy", 
      context: { commitSha, environment, buildId }, 
      timestamp: new Date().toISOString() 
    },
    { 
      outcome: status === "success" ? "ALLOW" : "DENY", 
      reason: `Deploy ${status}`, 
      timestamp: new Date().toISOString() 
    }
  );

  await prisma.deployEvent.create({
    data: {
      id,
      buildId: buildId || null,
      environment,
      commitSha,
      deployedAt: new Date(),
      ledgerHash: ledgerEntry.hash,
      status,
    },
  });

  return { id, ledgerHash: ledgerEntry.hash };
}

// Schema version tracking with hashchain
export async function recordSchemaChange(
  schemaContent: string,
  migrationName?: string
): Promise<{ schemaHash: string; ledgerHash: string }> {
  const schemaHash = crypto.createHash("sha256").update(schemaContent).digest("hex");

  // Get previous version for hashchain
  const previousVersion = await prisma.schemaVersion.findFirst({
    orderBy: { appliedAt: "desc" },
  });

  // Create ledger proof
  const ledgerEntry = await appendLedger(
    { 
      action: "schema_change", 
      context: { schemaHash, migrationName }, 
      timestamp: new Date().toISOString() 
    },
    { 
      outcome: "ALLOW", 
      reason: "Schema change recorded", 
      timestamp: new Date().toISOString() 
    }
  );

  await prisma.schemaVersion.create({
    data: {
      id: crypto.randomUUID(),
      schemaHash,
      previousHash: previousVersion?.schemaHash || null,
      appliedAt: new Date(),
      migrationName: migrationName || null,
      ledgerHash: ledgerEntry.hash,
    },
  });

  return { schemaHash, ledgerHash: ledgerEntry.hash };
}

export { prisma } from "./db";
export * from "./db";
