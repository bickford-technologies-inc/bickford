const { enumerateCapabilities, optrSelect } = require('../types');
const { runInvariants } = require('../invariants/run');
const { emitMaxTelemetry } = require('../max/emitTelemetry');
const { persistMaxTelemetry } = require('../ledger/maxTelemetry');
const { explainSlowdown } = require('../explain/generate');
const { kickoffDeepResearch } = require('./deepResearch');

async function executeIntent(intent, state) {
  kickoffDeepResearch(intent, state).catch(() => {});
  const allActions = enumerateCapabilities(state);
  const invariantFailures = runInvariants(state);

  const admissible = allActions.filter(a =>
    runInvariants(state, a).length === 0
  );

  const telemetry = emitMaxTelemetry(
    allActions.length,
    admissible.length,
    invariantFailures.map(f => f.invariant)
  );

  await persistMaxTelemetry(telemetry);

  if (admissible.length === 0) {
    const explanation = explainSlowdown(
      intent,
      allActions.length,
      0,
      invariantFailures
    );
    throw explanation;
  }

  return optrSelect(admissible);
}

module.exports = { executeIntent };
