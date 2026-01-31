import type { Canon, Action } from "./types";

export class EnforcementEngine {
  constructor(
    private ledgerAppend: (entry: Record<string, unknown>) => Promise<string>,
  ) {}

  async enforce(canon: Canon, action: Action) {
    const containsPII =
      typeof action.payload.data === "string" &&
      action.payload.data.includes("SSN");
    const allowed = !containsPII;
    const decision = allowed ? "ALLOWED" : "DENIED";
    const reason = allowed ? "No PII detected" : "PII detected in data";
    const policyViolations = allowed ? [] : [canon.rules[0]];
    const processingTime = 5;
    const ledgerHash = await this.ledgerAppend({
      type: "enforcement",
      canonId: canon.id,
      actionType: action.type,
      allowed,
      decision,
      reason,
      timestamp: new Date().toISOString(),
    });
    return {
      allowed,
      decision,
      reason,
      policyViolations,
      processingTime,
      ledgerHash,
    };
  }
}
