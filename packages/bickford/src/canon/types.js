"use strict";
/**
 * Bickford Canon - Core Types
 * TIMESTAMP: 2025-12-21T14:41:00-05:00
 * LOCKED: This is canonical authority - changes require promotion gate
 *
 * Mathematical foundation for Bickford decision framework.
 * Minimizes E[Time-to-Value] subject to invariant constraints.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
/**
 * Canon authority types
 * Re-exported from @bickford/types
 * DO NOT define types here.
 */
__exportStar(require("@bickford/types"), exports);
