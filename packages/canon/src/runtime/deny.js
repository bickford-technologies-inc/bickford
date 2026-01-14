"use strict";
/**
 * Runtime Denial Helper
 * TIMESTAMP: 2026-02-08T00:00:00Z
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deny = deny;
function deny(params) {
    return {
        ts: params.timestamp,
        actionId: params.actionId,
        denied: true,
        reasonCodes: [params.reason],
        message: params.message,
        context: params.context,
    };
}
