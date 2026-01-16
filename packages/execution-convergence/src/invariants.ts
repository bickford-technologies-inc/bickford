import { Constraint, ExecutableStep } from "./types";
import { RefusalError } from "./errors";

export function assertSingleAuthority(agentIds: string[]): void {
  if (agentIds.length !== 1) {
    throw new RefusalError("Exactly one execution authority required");
  }
}

export function validateConstraints(
  plan: ExecutableStep[],
  constraints: Constraint[]
): void {
  for (const c of constraints) {
    if (c.severity === "HARD") {
      throw new RefusalError(
        `Hard constraint violated: ${c.id} — ${c.description}`
      );
    }
  }
}

// HARDENING 1: Enforce Executable Plan Structure
export function assertExecutablePlan(plan: ExecutableStep[]): void {
  if (!Array.isArray(plan) || plan.length === 0) {
    throw new RefusalError("Executable plan must be a non-empty array");
  }
  for (const step of plan) {
    if (
      typeof step !== "object" ||
      typeof step.id !== "string" ||
      typeof step.action !== "string"
    ) {
      throw new RefusalError("Executable plan contains invalid step structure");
    }
  }
}
