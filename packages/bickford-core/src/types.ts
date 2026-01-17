/**
 * @typedef {Object} State
 * @typedef {{ id: string }} Action
 * @typedef {{ id: string, objective: string }} Intent
 * @typedef {Object} SlowdownExplanation
 * @typedef {Object} MaxArtifact
 */

function enumerateCapabilities(state) {
  // TODO: Implement actual capability enumeration
  return [];
}

function optrSelect(actions) {
  // TODO: Implement actual OPTR selection logic
  return actions[0];
}

module.exports = {
  enumerateCapabilities,
  optrSelect,
};
