import type { Intent } from "./intent.js";

export type Decision = {
  id: string;
  intent: Intent;
  outcome?: "ALLOW" | "DENY" | string;
  reason?: string;
  timestamp?: string;
};
