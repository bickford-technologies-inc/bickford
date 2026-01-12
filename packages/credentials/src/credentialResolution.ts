// Credential resolution logic
import { Credential } from "./credentialTypes";
import { credentialRegistry } from "./credentialRegistry";

export function resolveCredential(id: string): Credential | undefined {
  return credentialRegistry.find((c) => c.id === id);
}
