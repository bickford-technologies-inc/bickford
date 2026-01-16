export type TenantEnvLedgerEntry = {
  ts: string;
  tenantId: string;
  kind: "ENV_SET" | "ENV_ROTATE" | "ENV_DELETE" | "ENV_ROLLBACK";
  key: string;
  scope: "development" | "preview" | "production";
  oldHash: string | null;
  newHash: string;
  actor: string;
  intentId: string;
  prevHash: string;
  hash: string;
};
