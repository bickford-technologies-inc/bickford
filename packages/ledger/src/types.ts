export type { LedgerEntry } from "@bickford/types";

export type Intent = {
  id?: string;
  type?: string;
  payload?: unknown;
};

export type Decision = {
  id?: string;
  outcome?: string;
  rationale?: string;
  payload?: unknown;
};
