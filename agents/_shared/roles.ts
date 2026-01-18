export type AgentRole =
  | "types"
  | "ledger"
  | "execution"
  | "ui"
  | "infra"
  | "ci";

export const WRITE_SCOPE: Record<AgentRole, string[]> = {
  types: ["packages/types"],
  ledger: ["packages/ledger"],
  execution: ["packages/execution-convergence"],
  ui: ["packages/web-ui"],
  infra: ["next.config.*", "vercel.json", "turbo.json"],
  ci: ["scripts", ".github"],
};
