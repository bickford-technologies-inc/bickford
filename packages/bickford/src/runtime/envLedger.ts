import crypto from "crypto";
import { EnvLedgerEntry } from "./envLedgerTypes";

const ZERO = "0".repeat(64);

let lastHash = ZERO;
export const envLedger: EnvLedgerEntry[] = [];

function sha(val: string) {
  return crypto.createHash("sha256").update(val).digest("hex");
}

export function appendEnv(entry: Omit<EnvLedgerEntry, "hash" | "prevHash">) {
  const payload = { ...entry, prevHash: lastHash };
  const hash = sha(JSON.stringify(payload));
  const full = { ...payload, hash };
  envLedger.push(full);
  lastHash = hash;
  return full;
}

export function verifyEnvLedger(): boolean {
  let prev = ZERO;
  for (const e of envLedger) {
    const check = sha(JSON.stringify({ ...e, hash: undefined }));
    if (check !== e.hash || e.prevHash !== prev) return false;
    prev = e.hash;
  }
  return true;
}
