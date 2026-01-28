import {
  ConvergenceInput,
  ConvergenceResult,
  AgentDescriptor,
  ExecutableStep,
} from "./types.js";
import { RefusalError } from "./errors.js";
import {
  assertSingleAuthority,
  validateConstraints,
  assertExecutablePlan,
} from "./invariants.js";
import { hashArtifact } from "./hash.js";
import { appendToLedger, ExecutionLedger } from "./ledger.js";

export function converge(input: ConvergenceInput): ConvergenceResult {
  if (input.mode !== "EXECUTION") {
    return {
      converged: false,
      reason: "invalid_mode",
    };
  }

  const authority = input.agents.filter(
    (a) => a.role === "EXECUTION_AUTHORITY",
  );
  const auditors = input.agents.filter((a) => a.role === "CONSTRAINT_AUDITOR");

  if (auditors.length === 0) {
    return {
      converged: false,
      reason: "no_auditor",
    };
  }

  try {
    assertSingleAuthority(authority.map((a) => a.id));

    const authorityOutput = input.outputs.find(
      (o) => o.agentId === authority[0].id,
    );

    if (!authorityOutput || !Array.isArray(authorityOutput.content)) {
      return {
        converged: false,
        reason: "no_executable_plan",
      };
    }

    const executablePlan = authorityOutput.content as ExecutableStep[];

    // HARDENING 1: structural enforcement
    try {
      assertExecutablePlan(executablePlan);
    } catch (err) {
      return {
        converged: false,
        reason: "refusal",
      };
    }

    const allConstraints = input.outputs.flatMap((o) => o.constraints ?? []);

    validateConstraints(executablePlan, allConstraints);

    // Optionally compute score and trace here if needed
    const score = undefined; // placeholder for future scoring logic
    const trace = undefined; // placeholder for future trace logic

    // Ledger/persistence owns artifact materialization
    // If you need to persist, do so here, but do not return artifact
    // const artifactPayload = { ... };
    // const artifact = { ... };
    // appendToLedger(artifact);

    return {
      converged: true,
      artifact: { executablePlan },
      score,
      trace,
    };
  } catch (err) {
    if (err instanceof RefusalError) {
      return {
        converged: false,
        reason: "refusal",
      };
    }
    throw err;
  }
}

export async function convergeWithLedger(
  input: ConvergenceInput,
  ledger?: ExecutionLedger,
): Promise<ConvergenceResult> {
  const result = converge(input);
  if (ledger) {
    await ledger.append(result);
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _NoExtraFieldsAllowed = ConvergenceResult & {
  status?: never;
  artifact?: never;
};
