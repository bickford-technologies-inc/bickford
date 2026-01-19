/**
 * Migration Scoring for OPTR
 * TIMESTAMP: 2026-01-12T18:44:00Z
 *
 * Scores database migrations for risk and regression potential.
 * Only non-regressive migrations are permitted.
 *
 * INVARIANT: All migrations must be scored before application.
 * INVARIANT: Regressive migrations (backward incompatible) must be denied.
 */

import type { DeniedDecisionPayload } from "../types/denied";
import { DenialReasonCode } from "@bickford/types";

export interface MigrationAnalysis {
  migrationName: string;
  riskScore: number; // 0.0 (safe) to 1.0 (high risk)
  isRegressive: boolean;
  operations: MigrationOperation[];
  impactAnalysis: {
    tablesAffected: string[];
    dataLossRisk: boolean;
    downTimeRequired: boolean;
    rollbackPossible: boolean;
  };
}

export interface MigrationOperation {
  type: "CREATE" | "ALTER" | "DROP" | "RENAME" | "DATA";
  target: string; // table, column, index name
  details: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

/**
 * Score a migration based on its operations
 */
export function scoreMigration(analysis: MigrationAnalysis): number {
  let score = 0.0;

  // High-risk operations
  const highRiskOps = analysis.operations.filter(
    (op) => op.riskLevel === "HIGH",
  );
  score += highRiskOps.length * 0.3;

  // Data loss risk
  if (analysis.impactAnalysis.dataLossRisk) {
    score += 0.4;
  }

  // Rollback difficulty
  if (!analysis.impactAnalysis.rollbackPossible) {
    score += 0.2;
  }

  // Downtime requirement
  if (analysis.impactAnalysis.downTimeRequired) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

/**
 * Determine if migration is regressive (backward incompatible)
 */
export function isRegressiveMigration(analysis: MigrationAnalysis): boolean {
  const regressiveOps = analysis.operations.filter((op) => {
    // DROP operations are always regressive
    if (op.type === "DROP") return true;

    // RENAME without alias is regressive
    if (op.type === "RENAME" && !op.details.includes("alias")) return true;

    // ALTER that removes columns is regressive
    if (
      op.type === "ALTER" &&
      (op.details.includes("DROP COLUMN") || op.details.includes("REMOVE"))
    ) {
      return true;
    }

    return false;
  });

  return regressiveOps.length > 0;
}

/**
 * Parse Prisma migration SQL to extract operations
 *
 * Note: This is a simplified parser for common Prisma migrations.
 * Limitations:
 * - Does not handle schema-qualified tables (e.g., schema.table)
 * - May miss complex ALTER statements
 * - Assumes standard PostgreSQL syntax
 *
 * For production use, consider using a proper SQL parser.
 */
export function parseMigrationSQL(sql: string): MigrationOperation[] {
  const operations: MigrationOperation[] = [];
  const lines = sql
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  for (const line of lines) {
    const upper = line.toUpperCase();

    if (upper.startsWith("CREATE TABLE")) {
      // Match: CREATE TABLE "table" or CREATE TABLE table
      const match = line.match(/CREATE TABLE\s+["']?(\w+)["']?/i);
      operations.push({
        type: "CREATE",
        target: match?.[1] || "unknown",
        details: line,
        riskLevel: "LOW",
      });
    } else if (upper.startsWith("DROP TABLE")) {
      const match = line.match(/DROP TABLE\s+["']?(\w+)["']?/i);
      operations.push({
        type: "DROP",
        target: match?.[1] || "unknown",
        details: line,
        riskLevel: "HIGH",
      });
    } else if (upper.startsWith("ALTER TABLE")) {
      const match = line.match(/ALTER TABLE\s+["']?(\w+)["']?/i);
      let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";

      if (upper.includes("DROP COLUMN") || upper.includes("DROP CONSTRAINT")) {
        riskLevel = "HIGH";
      } else if (upper.includes("ADD COLUMN") || upper.includes("ADD INDEX")) {
        riskLevel = "LOW";
      }

      operations.push({
        type: "ALTER",
        target: match?.[1] || "unknown",
        details: line,
        riskLevel,
      });
    } else if (upper.startsWith("RENAME")) {
      const match = line.match(/RENAME\s+["']?(\w+)["']?/i);
      operations.push({
        type: "RENAME",
        target: match?.[1] || "unknown",
        details: line,
        riskLevel: "MEDIUM",
      });
    }
  }

  return operations;
}

/**
 * Analyze migration and produce full analysis
 */
export function analyzeMigration(
  migrationName: string,
  sql: string,
): MigrationAnalysis {
  const operations = parseMigrationSQL(sql);

  const tablesAffected = Array.from(new Set(operations.map((op) => op.target)));

  const dataLossRisk = operations.some(
    (op) =>
      op.type === "DROP" || (op.type === "ALTER" && op.riskLevel === "HIGH"),
  );

  const downTimeRequired = operations.some(
    (op) => op.type === "DROP" || op.type === "RENAME",
  );

  const rollbackPossible = !operations.some(
    (op) => op.type === "DROP" || op.type === "DATA",
  );

  const analysis: MigrationAnalysis = {
    migrationName,
    riskScore: 0,
    isRegressive: false,
    operations,
    impactAnalysis: {
      tablesAffected,
      dataLossRisk,
      downTimeRequired,
      rollbackPossible,
    },
  };

  analysis.riskScore = scoreMigration(analysis);
  analysis.isRegressive = isRegressiveMigration(analysis);

  return analysis;
}

/**
 * OPTR Gate: Migration regression check
 */
export function gateMigrationRegression(
  analysis: MigrationAnalysis,
  nowIso: string,
): DeniedDecisionPayload | null {
  if (!analysis.isRegressive) return null;

  const regressiveOps = analysis.operations.filter((op) => {
    return (
      op.type === "DROP" ||
      (op.type === "RENAME" && !op.details.includes("alias")) ||
      (op.type === "ALTER" && op.riskLevel === "HIGH")
    );
  });

  return {
    ts: Date.now(),
    reasonCodes: [DenialReasonCode.INVARIANT_VIOLATION],
    message: `Migration "${analysis.migrationName}" is regressive (backward incompatible)`,
    actionId: `migration:${analysis.migrationName}`,
    tenantId: "tenantId",
  };
}

/**
 * OPTR Gate: Migration risk bounds
 */
export function gateMigrationRisk(
  analysis: MigrationAnalysis,
  maxRiskScore: number,
  nowIso: string,
): DeniedDecisionPayload | null {
  if (analysis.riskScore <= maxRiskScore) return null;

  return {
    ts: Date.now(),
    reasonCodes: [DenialReasonCode.RISK_BOUND_EXCEEDED],
    message: "Migration is risky",
    actionId: `migration:${analysis.migrationName}`,
    tenantId: "tenantId",
  };
}

/**
 * Migrate legacy DeniedDecision to new format
 */
export function migrateDeniedDecision(legacy: unknown): DeniedDecisionPayload {
  // Migration logic
  return {
    decisionId: (legacy as any).id || `migrated-${Date.now()}`,
    ts: (legacy as any).timestamp || Date.now(),
    reasonCodes: (legacy as any).reasons || [],
    message: (legacy as any).message || "Migrated decision",
    intent: (legacy as any).intent || "UNKNOWN",
  };
}
