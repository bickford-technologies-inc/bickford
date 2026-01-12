// Credential type definitions and enums

export type CredentialTier = 1 | 2 | 3;

export type CredentialLifecycle =
  | "BOOTSTRAP_REQUIRED"
  | "ACTIVE"
  | "DEPRECATED"
  | "REVOKED";

export interface Credential {
  id: string;
  boundary: string;
  owner: string;
  tier: CredentialTier;
  automation: boolean;
  lifecycle: CredentialLifecycle;
  environments: string[];
}
