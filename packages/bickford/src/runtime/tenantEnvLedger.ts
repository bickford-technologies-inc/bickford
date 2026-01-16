import crypto from "crypto";
import { TenantEnvLedgerEntry } from "./tenantEnvLedgerTypes";

const ZERO = "0".repeat(64);

const ledgers: Record<string, TenantEnvLedgerEntry[]> = {};
const lastHashes: Record<string, string> = {};

function sha(val: string) {
  return crypto.createHash("sha256").update(val).digest("hex");
}

export function appendTenantEnv(
  entry: Omit<TenantEnvLedgerEntry, "hash" | "prevHash">
) {
  const tenant = entry.tenantId;
  const prev = lastHashes[tenant] ?? ZERO;

  const payload = { ...entry, prevHash: prev };
  const hash = sha(JSON.stringify(payload));

  const full: TenantEnvLedgerEntry = { ...payload, hash };

  ledgers[tenant] ||= [];
  ledgers[tenant].push(full);
  lastHashes[tenant] = hash;

  return full;
}

export function verifyTenantLedger(tenantId: string): boolean {
  const ledger = ledgers[tenantId];
  if (!ledger) return true;

  let prev = ZERO;
  for (const e of ledger) {
    const check = sha(JSON.stringify({ ...e, hash: undefined }));
    if (check !== e.hash || e.prevHash !== prev) return false;
    prev = e.hash;
  }
  return true;
}

export function getTenantLedger(tenantId: string) {
  return ledgers[tenantId] ?? [];
}
