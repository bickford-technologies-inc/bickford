// Credential policy logic
import { Credential } from "./credentialTypes";
import { credentialRegistry } from "./credentialRegistry";

export function getCredentialPolicy(credentialId: string) {
  const cred = credentialRegistry.find((c) => c.id === credentialId);
  if (!cred) throw new Error(`Credential not found: ${credentialId}`);
  // Example: return tier and lifecycle for policy enforcement
  return {
    tier: cred.tier,
    lifecycle: cred.lifecycle,
    automation: cred.automation,
    environments: cred.environments,
  };
}
