"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreMigration = scoreMigration;
exports.isRegressiveMigration = isRegressiveMigration;
exports.parseMigrationSQL = parseMigrationSQL;
exports.analyzeMigration = analyzeMigration;
exports.gateMigrationRegression = gateMigrationRegression;
exports.gateMigrationRisk = gateMigrationRisk;
const types_1 = require("./types");
/**
 * Score a migration based on its operations
 */
function scoreMigration(analysis) {
    let score = 0.0;
    // High-risk operations
    const highRiskOps = analysis.operations.filter((op) => op.riskLevel === "HIGH");
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
function isRegressiveMigration(analysis) {
    const regressiveOps = analysis.operations.filter((op) => {
        // DROP operations are always regressive
        if (op.type === "DROP")
            return true;
        // RENAME without alias is regressive
        if (op.type === "RENAME" && !op.details.includes("alias"))
            return true;
        // ALTER that removes columns is regressive
        if (op.type === "ALTER" &&
            (op.details.includes("DROP COLUMN") || op.details.includes("REMOVE"))) {
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
function parseMigrationSQL(sql) {
    const operations = [];
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
        }
        else if (upper.startsWith("DROP TABLE")) {
            const match = line.match(/DROP TABLE\s+["']?(\w+)["']?/i);
            operations.push({
                type: "DROP",
                target: match?.[1] || "unknown",
                details: line,
                riskLevel: "HIGH",
            });
        }
        else if (upper.startsWith("ALTER TABLE")) {
            const match = line.match(/ALTER TABLE\s+["']?(\w+)["']?/i);
            let riskLevel = "MEDIUM";
            if (upper.includes("DROP COLUMN") || upper.includes("DROP CONSTRAINT")) {
                riskLevel = "HIGH";
            }
            else if (upper.includes("ADD COLUMN") || upper.includes("ADD INDEX")) {
                riskLevel = "LOW";
            }
            operations.push({
                type: "ALTER",
                target: match?.[1] || "unknown",
                details: line,
                riskLevel,
            });
        }
        else if (upper.startsWith("RENAME")) {
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
function analyzeMigration(migrationName, sql) {
    const operations = parseMigrationSQL(sql);
    const tablesAffected = Array.from(new Set(operations.map((op) => op.target)));
    const dataLossRisk = operations.some((op) => op.type === "DROP" || (op.type === "ALTER" && op.riskLevel === "HIGH"));
    const downTimeRequired = operations.some((op) => op.type === "DROP" || op.type === "RENAME");
    const rollbackPossible = !operations.some((op) => op.type === "DROP" || op.type === "DATA");
    const analysis = {
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
function gateMigrationRegression(analysis, nowIso) {
    if (!analysis.isRegressive)
        return null;
    const regressiveOps = analysis.operations.filter((op) => {
        return (op.type === "DROP" ||
            (op.type === "RENAME" && !op.details.includes("alias")) ||
            (op.type === "ALTER" && op.riskLevel === "HIGH"));
    });
    return {
        denied: true,
        ts: nowIso,
        actionId: `migration:${analysis.migrationName}`,
        tenantId: "tenantId",
        reasonCodes: [types_1.DenialReasonCode.INVARIANT_VIOLATION],
        message: `Migration "${analysis.migrationName}" is regressive (backward incompatible)`,
    };
}
/**
 * OPTR Gate: Migration risk bounds
 */
function gateMigrationRisk(analysis, maxRiskScore, nowIso) {
    if (analysis.riskScore <= maxRiskScore)
        return null;
    return {
        denied: true,
        ts: nowIso,
        actionId: `migration:${analysis.migrationName}`,
        tenantId: "tenantId",
        reasonCodes: [types_1.DenialReasonCode.RISK_BOUND_EXCEEDED],
        message: "Migration is risky",
    };
}
