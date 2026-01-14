"use strict";
/**
 * Bickford Canon - Core Types
 * TIMESTAMP: 2025-12-21T14:41:00-05:00
 * LOCKED: This is canonical authority - changes require promotion gate
 *
 * Mathematical foundation for Bickford decision framework.
 * Minimizes E[Time-to-Value] subject to invariant constraints.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DenialReasonCode = void 0;
/**
 * Stable taxonomy for denial reasons
 * UPGRADE #2: WhyNot stable taxonomy
 */
var DenialReasonCode;
(function (DenialReasonCode) {
    DenialReasonCode["MISSING_CANON_PREREQS"] = "MISSING_CANON_PREREQS";
    DenialReasonCode["INVARIANT_VIOLATION"] = "INVARIANT_VIOLATION";
    DenialReasonCode["NON_INTERFERENCE_VIOLATION"] = "NON_INTERFERENCE_VIOLATION";
    DenialReasonCode["AUTHORITY_BOUNDARY_FAIL"] = "AUTHORITY_BOUNDARY_FAIL";
    DenialReasonCode["RISK_BOUND_EXCEEDED"] = "RISK_BOUND_EXCEEDED";
    DenialReasonCode["COST_BOUND_EXCEEDED"] = "COST_BOUND_EXCEEDED";
    DenialReasonCode["SUCCESS_PROB_TOO_LOW"] = "SUCCESS_PROB_TOO_LOW";
})(DenialReasonCode || (exports.DenialReasonCode = DenialReasonCode = {}));
