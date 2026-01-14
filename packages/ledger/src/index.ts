import * as crypto from "crypto";
import { Intent, LedgerEntry, Decision } from "@bickford/types";
import { prisma, withLedgerTx } from "./db";

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
      tenantId: tenantId ?? null,
    },
  });

  // Only include tenantId if present and string
  const result: LedgerEntry = {
    id: entry.id,
    intent,
    decision,
    hash: entry.hash,
    createdAt: entry.createdAt.toISOString(),
    ...(entry.tenantId ? { tenantId: entry.tenantId } : {}),
  };
  return result;
}

export async function getLedger(tenantId?: string): Promise<LedgerEntry[]> {
  const rows = await prisma.ledgerEntry.findMany({
    where: tenantId ? { tenantId } : {},
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r: any) => {
    const entry: LedgerEntry = {
      id: r.id,
      intent: r.intent as Intent,
      decision: r.decision as Decision,
      hash: r.hash,
      createdAt: r.createdAt.toISOString(),
      ...(r.tenantId ? { tenantId: r.tenantId } : {}),
    };
    return entry;
  });
}

// Build event tracking
export async function recordBuildEvent(
  commitSha: string,
  branch: string,
  status: "success" | "failure" | "in_progress"
): Promise<{ id: string; ledgerHash: string | null }> {
  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
      {
        action: "build",
        context: { commitSha, branch },
        timestamp: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        intent: "build",
        timestamp: new Date().toISOString(),
        outcome: "ALLOW",
        reason: "Build succeeded",
      }
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
      timestamp: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      intent: "deploy",
      timestamp: new Date().toISOString(),
      outcome: status === "success" ? "ALLOW" : "DENY",
      reason: `Deploy ${status}`,
    }
  );
  await prisma.deployEvent.create({
    data: {
      id,
      buildId: buildId || "",
      createdAt: new Date(),
    },
  });
  return { id, ledgerHash: ledgerEntry.hash };
}

// Schema version tracking with hashchain
export async function recordSchemaChange(
  schemaContent: string,
  migrationName?: string
): Promise<{ schemaHash: string; ledgerHash: string }> {
  const schemaHash = crypto
    .createHash("sha256")
    .update(schemaContent)
    .digest("hex");

  // Get previous version for hashchain
  const previousVersion = await prisma.meta.findFirst({
    orderBy: { id: "desc" },
  });
  const version = (previousVersion?.schemaVersion || 0) + 1;

  // Create ledger proof
  const ledgerEntry = await appendLedger(
    {
      action: "schema_change",
      context: { schemaHash, migrationName },
      timestamp: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      intent: "schema_change",
      timestamp: new Date().toISOString(),
      outcome: "ALLOW",
      reason: "Schema change recorded",
    }
  );

  await prisma.meta.create({
    data: { schemaVersion: version },
  });

  return { schemaHash, ledgerHash: ledgerEntry.hash };
}

export * from "./db";
export * from "./deploy";
export * from "./edge";
export * from "./ledgerEntry";
export * from "./prisma";
