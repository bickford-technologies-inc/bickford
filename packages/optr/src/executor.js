import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DEFAULT_AGENTS = ["codex", "claude", "copilot", "mscopilot"];

const createHash = (value) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

const ensureDir = (targetPath) => {
  fs.mkdirSync(targetPath, { recursive: true });
};

const writeJson = (targetPath, payload) => {
  fs.writeFileSync(targetPath, `${JSON.stringify(payload, null, 2)}\n`);
};

const appendLedgerEntry = (ledgerPath, entry) => {
  ensureDir(path.dirname(ledgerPath));
  fs.appendFileSync(ledgerPath, `${JSON.stringify(entry)}\n`);
};

const buildRunnerResult = ({ agent, output, admissible, ttvEstimate, invariants }) => {
  const result = {
    agent,
    output,
    admissible,
    ttvEstimate,
    invariants,
  };

  return {
    ...result,
    hash: createHash(result),
  };
};

const missingKeyInvariant = (provider) =>
  `missing_${provider.toLowerCase()}_api_key`;

export const createDefaultRunners = (config) => {
  const runners = {
    runCodex: async (context) => {
      const admissible = Boolean(config.openaiKey);
      const invariants = admissible ? [] : [missingKeyInvariant("openai")];

      return buildRunnerResult({
        agent: "codex",
        output: {
          status: admissible ? "stubbed" : "not-configured",
          workflow: context.workflow,
        },
        admissible,
        ttvEstimate: admissible ? 1200 : Number.POSITIVE_INFINITY,
        invariants,
      });
    },
    runClaude: async (context) => {
      const admissible = Boolean(config.anthropicKey);
      const invariants = admissible ? [] : [missingKeyInvariant("anthropic")];

      return buildRunnerResult({
        agent: "claude",
        output: {
          status: admissible ? "stubbed" : "not-configured",
          workflow: context.workflow,
        },
        admissible,
        ttvEstimate: admissible ? 1300 : Number.POSITIVE_INFINITY,
        invariants,
      });
    },
    runCopilot: async (context) =>
      buildRunnerResult({
        agent: "copilot",
        output: {
          status: "stubbed",
          workflow: context.workflow,
        },
        admissible: true,
        ttvEstimate: 1500,
        invariants: [],
      }),
    runMsCopilot: async (context) =>
      buildRunnerResult({
        agent: "mscopilot",
        output: {
          status: "stubbed",
          workflow: context.workflow,
        },
        admissible: true,
        ttvEstimate: 1600,
        invariants: [],
      }),
  };

  return runners;
};

export const canonicalSelectOptr = (results, constraints = []) => {
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error("No agent results available for OPTR selection.");
  }

  const admissible = results.filter((result) => result.admissible);
  const candidates = admissible.length > 0 ? admissible : results;

  const selection = candidates.reduce((best, current) => {
    if (current.ttvEstimate < best.ttvEstimate) {
      return current;
    }

    return best;
  });

  const constraintInvariants = constraints
    .filter((constraint) => constraint.length > 0)
    .map((constraint) => `constraint:${constraint}`);

  const mergedInvariants = Array.from(
    new Set([...(selection.invariants ?? []), ...constraintInvariants]),
  );

  const result = {
    ...selection,
    invariants: mergedInvariants,
  };

  return {
    ...result,
    hash: createHash(result),
  };
};

const persistOutputs = ({ datalakeRoot, context, results, selected }) => {
  const workflowRoot = path.join(
    datalakeRoot,
    "workflows",
    context.workflow,
  );
  const outputsRoot = path.join(workflowRoot, "agent-outputs");

  ensureDir(outputsRoot);
  results.forEach((result) => {
    writeJson(path.join(outputsRoot, `${result.agent}.json`), result);
  });

  writeJson(path.join(workflowRoot, "optr-selection.json"), selected);
};

const buildLedgerEntry = ({ context, results, selected }) => ({
  timestamp: Date.now(),
  intent: context,
  agents: results.map((result) => ({
    agent: result.agent,
    admissible: result.admissible,
    ttvEstimate: result.ttvEstimate,
    invariants: result.invariants,
    hash: result.hash,
  })),
  selection: {
    agent: selected.agent,
    admissible: selected.admissible,
    ttvEstimate: selected.ttvEstimate,
    invariants: selected.invariants,
    hash: selected.hash,
  },
});

const ensureWorkflow = (context) => {
  if (!context?.workflow || !context?.intent) {
    throw new Error("Intent context requires workflow and intent fields.");
  }
};

const normalizeContext = (context) => ({
  constraints: [],
  metadata: {},
  ...context,
  constraints: context?.constraints ?? [],
});

const optrExecutor = async (
  intentContext,
  runners,
  selectOptr,
  config,
) => {
  const context = normalizeContext(intentContext);

  ensureWorkflow(context);

  const runnerFunctions = DEFAULT_AGENTS.map((agent) => {
    switch (agent) {
      case "codex":
        return runners.runCodex;
      case "claude":
        return runners.runClaude;
      case "copilot":
        return runners.runCopilot;
      case "mscopilot":
        return runners.runMsCopilot;
      default:
        throw new Error(`Unknown runner: ${agent}`);
    }
  });

  const results = await Promise.all(
    runnerFunctions.map((run) => run(context)),
  );

  const selected = selectOptr(results, context.constraints);

  persistOutputs({
    datalakeRoot: config.datalakeRoot,
    context,
    results,
    selected,
  });

  appendLedgerEntry(
    config.ledgerPath,
    buildLedgerEntry({ context, results, selected }),
  );

  return selected;
};

export default optrExecutor;
