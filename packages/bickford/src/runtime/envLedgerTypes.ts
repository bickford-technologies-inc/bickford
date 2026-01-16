export type EnvLedgerEntry = {
  ts: string;
  kind: "ENV_SET" | "ENV_ROTATE" | "ENV_DELETE";
  key: string;
  scope: "development" | "preview" | "production";
  oldHash: string | null;
  newHash: string;
  actor: string;
  intentId: string;
  prevHash: string;
  hash: string;
};
