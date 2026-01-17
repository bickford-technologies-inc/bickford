/**
 * @typedef {Object} SlowdownExplanation
 * @property {number} timestamp
 * @property {string} intent
 * @property {{ id: string, reason: string }[]} violatedInvariants
 * @property {{ maxActions: number, allowedActions: number }} impact
 */
