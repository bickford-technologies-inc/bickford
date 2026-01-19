// CANON — PURE CONTRACT ONLY
// Implementation intentionally deferred to integration layer

export interface EnvVarUpsert {
  project: string;
  key: string;
  value: string;
  targets: string[];
  encrypted?: boolean;
}

export interface EnvManager {
  upsertEnvVar(input: EnvVarUpsert): Promise<void>;
}
