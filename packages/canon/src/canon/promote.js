"use strict";
/**
 * Canon Promotion Logic
 * Handles promotion of canon items from EVIDENCE -> PROPOSED -> CANON.
 * Enforces 4-test promotion gate.
 * TIMESTAMP: 2026-02-08T00:00:00Z
 * CANONICAL: This is part of Chat v2 execution surface
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.promoteCanonItem = promoteCanonItem;
exports.validatePromotionPath = validatePromotionPath;
exports.createPromotionTests = createPromotionTests;
/**
 * Promote a canon item to a higher level
 */
function promoteCanonItem(item, targetLevel, tests) {
    const decision = {
        ts: new Date().toISOString(),
        itemId: item.id,
        from: item.level,
        to: targetLevel,
        tests,
        approved: false,
        reason: "",
    };
    // Canonical promotion gate: all tests must be true
    const allPassed = tests.resistance &&
        tests.reproducible &&
        tests.invariantSafe &&
        tests.feasibilityImpact;
    if (!allPassed) {
        decision.approved = false;
        decision.reason = "One or more promotion tests failed";
        return decision;
    }
    // Promotion allowed
    decision.approved = true;
    decision.reason = "All promotion tests passed";
    return decision;
}
/**
 * Validate promotion path: EVIDENCE -> PROPOSED -> CANON
 * Cannot skip levels
 */
function validatePromotionPath(from, to) {
    const levels = ["EVIDENCE", "PROPOSED", "CANON"];
    const fromIdx = levels.indexOf(from);
    const toIdx = levels.indexOf(to);
    // Must be exactly one level up
    return toIdx === fromIdx + 1;
}
/**
 * Create promotion tests result
 */
function createPromotionTests(resistance, reproducible, invariantSafe, feasibilityImpact, evidenceRefs) {
    return {
        resistance,
        reproducible,
        invariantSafe,
        feasibilityImpact,
        evidenceRefs,
    };
}
