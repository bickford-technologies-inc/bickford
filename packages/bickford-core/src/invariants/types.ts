/**
 * @typedef {{ ok: true } | { ok: false, reason: string }} InvariantResult
 * @typedef {{ id: string, description: string, assert: (state: any, action?: any) => InvariantResult }} InvariantTest
 */
