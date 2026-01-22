const { enumerateCapabilities, optrSelect } = require('../types');
const { runInvariants } = require('../invariants/run');
const { emitMaxTelemetry } = require('../max/emitTelemetry');
const { persistMaxTelemetry } = require('../ledger/maxTelemetry');
const { explainSlowdown } = require('../explain/generate');
const { kickoffDeepResearch } = require('./deepResearch');
const { valuePerHourUsd } = require('../business/processWorkflows');

function summarizeDeepResearch(state) {
  const cfg = state?.deepResearch;
  if (!cfg) {
    return undefined;
  }

  const tools = Array.isArray(cfg.tools)
    ? cfg.tools.map(tool => tool?.type).filter(Boolean)
    : undefined;

  const workflowValuePerHourUsd = cfg.valuePerHourUsd ?? (
    cfg.businessProcessWorkflow
      ? valuePerHourUsd(cfg.businessProcessWorkflow)
      : undefined
  );

  return {
    enabled: Boolean(cfg.enabled),
    model: cfg.model,
    background: cfg.background,
    maxToolCalls: cfg.maxToolCalls,
    tools,
    workflowId: cfg.businessProcessWorkflow?.id,
    workflowName: cfg.businessProcessWorkflow?.name,
    valuePerHourUsd: workflowValuePerHourUsd,
    continuousCompounding: Boolean(
      cfg.continuousCompounding ??
        cfg.compoundKnowledge ||
        cfg.compoundConfig ||
        cfg.adaptivePerformance?.enabled
    ),
    compoundKnowledge: cfg.compoundKnowledge,
    adaptivePerformance: Boolean(cfg.adaptivePerformance?.enabled),
    compoundConfig: Boolean(cfg.compoundConfig),
  };
}

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
    invariantFailures.map(f => f.invariant),
    summarizeDeepResearch(state)
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
