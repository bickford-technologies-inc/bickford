/**
 * Runtime Environment Invariant Enforcement
 * TIMESTAMP: 2026-01-12T18:44:00Z
 *
 * Validates runtime environment context and enforces invariants:
 * 1. Prisma only runs in Node.js (never Edge)
 * 2. Required environment variables are present
 * 3. Database connectivity is valid
 * 4. Node vs Edge context detection
 */

import { DenialReasonCode } from "@bickford/types";
import type { WhyNotTrace } from "@bickford/authority";

export interface RuntimeContext {
  isNode: boolean;
  isEdge: boolean;
  environment: "development" | "production" | "test" | "staging";
  hasPrisma: boolean;
  hasDatabase: boolean;
  requiredEnvs: string[];
  missingEnvs: string[];
}

/**
 * Detect if running in Node.js runtime
 */
export function isNodeRuntime(): boolean {
  return (
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null &&
    typeof (globalThis as any).EdgeRuntime === "undefined"
  );
}

/**
 * Detect if running in Edge runtime
 */
export function isEdgeRuntime(): boolean {
  return (
    typeof (globalThis as any).EdgeRuntime !== "undefined" ||
    process.env.NEXT_RUNTIME === "edge" ||
    process.env.VERCEL_EDGE === "1"
  );
}

/**
 * Get current runtime context
 */
export function getRuntimeContext(requiredEnvs: string[] = []): RuntimeContext {
  const isNode = isNodeRuntime();
  const isEdge = isEdgeRuntime();

  const environment = (process.env.NODE_ENV as any) || "development";

  const hasPrisma = isNode && typeof process.env.DATABASE_URL === "string";
  const hasDatabase = typeof process.env.DATABASE_URL === "string";

  const missingEnvs = requiredEnvs.filter(
    (env) => typeof process.env[env] === "undefined",
  );

  return {
    isNode,
    isEdge,
    environment,
    hasPrisma,
    hasDatabase,
    requiredEnvs,
    missingEnvs,
  };
}

/**
 * OPTR Gate: Prisma context validation
 * Ensures Prisma is only used in Node.js
 */
export function gatePrismaContext(
  action: { id: string; name: string; usesPrisma?: boolean },
  nowIso: string,
): WhyNotTrace | null {
  if (!action.usesPrisma) return null;

  const context = getRuntimeContext();

  if (!context.isNode) {
    return {
      ts: nowIso,
      actionId: action.id,
      denied: true,
      reasonCodes: [DenialReasonCode.INVARIANT_VIOLATION],
      message: `Action "${action.name}" requires Prisma but is running in Edge runtime. Use @bickford/ledger/edge instead.`,
      context: {
        isNode: context.isNode,
        isEdge: context.isEdge,
        recommendation: "Use fetch-based Edge API instead of Prisma Client",
      },
    };
  }

  if (!context.hasDatabase) {
    return {
      ts: nowIso,
      actionId: action.id,
      denied: true,
      reasonCodes: [DenialReasonCode.INVARIANT_VIOLATION],
      message: `Action "${action.name}" requires DATABASE_URL environment variable`,
      context: {
        missingEnv: "DATABASE_URL",
      },
    };
  }

  return null;
}

/**
 * OPTR Gate: Required environment variables
 */
export function gateRequiredEnvs(
  action: { id: string; name: string; requiredEnvs?: string[] },
  nowIso: string,
): WhyNotTrace | null {
  if (!action.requiredEnvs || action.requiredEnvs.length === 0) return null;

  const context = getRuntimeContext(action.requiredEnvs);

  if (context.missingEnvs.length === 0) return null;

  return {
    ts: nowIso,
    actionId: action.id,
    denied: true,
    reasonCodes: [DenialReasonCode.INVARIANT_VIOLATION],
    message: `Action "${
      action.name
    }" requires environment variables: ${context.missingEnvs.join(", ")}`,
    context: {
      missingEnvs: context.missingEnvs,
      requiredEnvs: action.requiredEnvs,
    },
  };
}

/**
 * Validate Turbo environment configuration
 */
export function validateTurboEnvs(requiredGlobalEnvs: string[]): {
  valid: boolean;
  missing: string[];
} {
  const missing = requiredGlobalEnvs.filter(
    (env) => typeof process.env[env] === "undefined",
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Assert Node runtime or throw
 */
export function assertNodeRuntime(): void {
  if (!isNodeRuntime()) {
    throw new Error(
      "INVARIANT VIOLATION: This module requires Node.js runtime. " +
        "Running in Edge runtime is not permitted.",
    );
  }
}

/**
 * Assert Edge runtime or warn
 */
export function assertEdgeRuntime(): void {
  if (!isEdgeRuntime()) {
    console.warn(
      "Warning: Edge-specific module loaded in non-edge environment. " +
        "Consider using Node.js-specific modules for better performance.",
    );
  }
}
