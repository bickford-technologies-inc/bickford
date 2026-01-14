"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNodeRuntime = isNodeRuntime;
exports.isEdgeRuntime = isEdgeRuntime;
exports.getRuntimeContext = getRuntimeContext;
exports.gatePrismaContext = gatePrismaContext;
exports.gateRequiredEnvs = gateRequiredEnvs;
exports.validateTurboEnvs = validateTurboEnvs;
exports.assertNodeRuntime = assertNodeRuntime;
exports.assertEdgeRuntime = assertEdgeRuntime;
const types_1 = require("./types");
/**
 * Detect if running in Node.js runtime
 */
function isNodeRuntime() {
    return (typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null &&
        typeof globalThis.EdgeRuntime === "undefined");
}
/**
 * Detect if running in Edge runtime
 */
function isEdgeRuntime() {
    return (typeof globalThis.EdgeRuntime !== "undefined" ||
        process.env.NEXT_RUNTIME === "edge" ||
        process.env.VERCEL_EDGE === "1");
}
/**
 * Get current runtime context
 */
function getRuntimeContext(requiredEnvs = []) {
    const isNode = isNodeRuntime();
    const isEdge = isEdgeRuntime();
    const environment = process.env.NODE_ENV || "development";
    const hasPrisma = isNode && typeof process.env.DATABASE_URL === "string";
    const hasDatabase = typeof process.env.DATABASE_URL === "string";
    const missingEnvs = requiredEnvs.filter((env) => typeof process.env[env] === "undefined");
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
function gatePrismaContext(action, nowIso) {
    if (!action.usesPrisma)
        return null;
    const context = getRuntimeContext();
    if (!context.isNode) {
        return {
            ts: nowIso,
            actionId: action.id,
            denied: true,
            reasonCodes: [types_1.DenialReasonCode.INVARIANT_VIOLATION],
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
            reasonCodes: [types_1.DenialReasonCode.INVARIANT_VIOLATION],
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
function gateRequiredEnvs(action, nowIso) {
    if (!action.requiredEnvs || action.requiredEnvs.length === 0)
        return null;
    const context = getRuntimeContext(action.requiredEnvs);
    if (context.missingEnvs.length === 0)
        return null;
    return {
        ts: nowIso,
        actionId: action.id,
        denied: true,
        reasonCodes: [types_1.DenialReasonCode.INVARIANT_VIOLATION],
        message: `Action "${action.name}" requires environment variables: ${context.missingEnvs.join(", ")}`,
        context: {
            missingEnvs: context.missingEnvs,
            requiredEnvs: action.requiredEnvs,
        },
    };
}
/**
 * Validate Turbo environment configuration
 */
function validateTurboEnvs(requiredGlobalEnvs) {
    const missing = requiredGlobalEnvs.filter((env) => typeof process.env[env] === "undefined");
    return {
        valid: missing.length === 0,
        missing,
    };
}
/**
 * Assert Node runtime or throw
 */
function assertNodeRuntime() {
    if (!isNodeRuntime()) {
        throw new Error("INVARIANT VIOLATION: This module requires Node.js runtime. " +
            "Running in Edge runtime is not permitted.");
    }
}
/**
 * Assert Edge runtime or warn
 */
function assertEdgeRuntime() {
    if (!isEdgeRuntime()) {
        console.warn("Warning: Edge-specific module loaded in non-edge environment. " +
            "Consider using Node.js-specific modules for better performance.");
    }
}
