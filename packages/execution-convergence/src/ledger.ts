import * as fs from "fs";
import * as path from "path";
import { LockedArtifact, ConvergenceResult } from "../src/types.js";

const LEDGER_PATH = path.resolve(process.cwd(), "execution-ledger.jsonl");

export function appendToLedger(artifact: LockedArtifact): void {
  const record = {
    ...artifact,
    recordedAt: new Date().toISOString(),
  };

  fs.appendFileSync(LEDGER_PATH, JSON.stringify(record) + "\n", {
    encoding: "utf-8",
  });
}

export interface ExecutionLedger {
  append(result: ConvergenceResult): Promise<void>;
}

export class InMemoryLedger implements ExecutionLedger {
  private log: ConvergenceResult[] = [];

  async append(result: ConvergenceResult): Promise<void> {
    this.log.push(result);
  }

  getAll(): ConvergenceResult[] {
    return [...this.log];
  }
}
