import { WhyNotExplanation } from "./types";

export function explainDenial(
  action: string,
  blockingInvariant: string,
  requiredChange: string,
  escalationAuthority: string
): WhyNotExplanation {
  return {
    deniedAction: action,
    blockingInvariant,
    requiredChange,
    escalationAuthority,
  };
}
