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
      status: "REFUSED",
      refusalReason: {
        code: "INVALID_MODE",
        message: "Convergence attempted outside EXECUTION mode",
      },
    };
  }

  const authority = input.agents.filter(
    (a) => a.role === "EXECUTION_AUTHORITY"
  );
  const auditors = input.agents.filter(
    (a) => a.role === "CONSTRAINT_AUDITOR"
  );

  if (auditors.length === 0) {
    return {
      status: "REFUSED",
      refusalReason: {
        code: "NO_AUDITOR",
        message: "Execution requires at least one constraint auditor",
      },
    };
  }

  try {
    assertSingleAuthority(authority.map((a) => a.id));

    const authorityOutput = input.outputs.find(
      (o) => o.agentId === authority[0].id
    );

    if (!authorityOutput || !Array.isArray(authorityOutput.content)) {
      throw new RefusalError("Authority did not provide executable plan");
    }

    const executablePlan = authorityOutput.content as ExecutableStep[];

    // HARDENING 1: structural enforcement
    assertExecutablePlan(executablePlan);

    const allConstraints = input.outputs.flatMap(
      (o) => o.constraints ?? []
    );

    validateConstraints(executablePlan, allConstraints);

    const artifactPayload = {
      executablePlan,
      authority: authority[0].id,
      constraints: allConstraints.map((c) => c.id),
    };

    const artifact = {
      hash: hashArtifact(artifactPayload),
      authorityAgentId: authority[0].id,
      executablePlan,
      provenance: {
        sourceAgents: input.agents.map((a) => a.id),
        convergedAt: new Date().toISOString(),
        enforcedConstraints: allConstraints.map((c) => c.id),
      },
    };

    appendToLedger(artifact);

    return {
      status: "LOCKED",
      artifact,
    };
  } catch (err) {
    if (err instanceof RefusalError) {
      return {
        status: "REFUSED",
        refusalReason: {
          code: "REFUSAL",
          message: err.message,
        },
      };
    }
    throw err;
  }
}

export async function convergeWithLedger(
  input: ConvergenceInput,
  ledger?: ExecutionLedger
): Promise<ConvergenceResult> {
  const result = converge(input);
  if (ledger) {
    await ledger.append(result);
  }
  return result;
}
