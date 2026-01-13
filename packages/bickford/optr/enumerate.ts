import { Intent } from "../../intent/types";

export interface ExecutionPath {
  kind: "code-fix" | "config-fix" | "rollback" | "deny";
  reversible: boolean;
  estimatedTTV?: number;
  risk?: number;
  successProbability?: number;
  score?: number;
}

export function enumeratePaths(intent: Intent): ExecutionPath[] {
  return [
    {
      kind: "code-fix",
      reversible: true,
      estimatedTTV: 5,
      risk: 0.2,
      successProbability: 0.95,
    },
    {
      kind: "config-fix",
      reversible: true,
      estimatedTTV: 3,
      risk: 0.1,
      successProbability: 0.98,
    },
    {
      kind: "rollback",
      reversible: true,
      estimatedTTV: 2,
      risk: 0.05,
      successProbability: 0.99,
    },
    {
      kind: "deny",
      reversible: false,
      estimatedTTV: 0,
      risk: 0,
      successProbability: 1.0,
    },
  ];
}
