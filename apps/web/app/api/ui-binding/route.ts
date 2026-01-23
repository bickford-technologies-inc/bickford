import crypto from "node:crypto";

import { canonicalHash, signHash } from "@bickford/authority";
import { appendProofLedger } from "@bickford/ledger";

import {
  computeUiSurfaceHashes,
  getLatestUiBinding,
  uiLedgerConstants,
} from "../../../lib/uiBinding";

export async function GET() {
  const current = computeUiSurfaceHashes();
  const latest = getLatestUiBinding();
  const payload = (latest?.payload ?? {}) as {
    uiHash?: string;
    cssHash?: string;
    combinedHash?: string;
  };

  const status = latest
    ? {
        ui: payload.uiHash === current.uiHash,
        css: payload.cssHash === current.cssHash,
        combined: payload.combinedHash === current.combinedHash,
      }
    : null;

  return Response.json({ current, latest, status });
}

export async function POST() {
  const current = computeUiSurfaceHashes();
  const payload = {
    surface: "web",
    ...current,
  };
  const hash = canonicalHash(payload);
  const signature = signHash(hash);

  const entry = appendProofLedger({
    id: crypto.randomUUID(),
    kind: uiLedgerConstants.kind,
    intentId: uiLedgerConstants.intentId,
    payload,
    authority: "UI_BINDING_AUTHORITY",
    hash,
    signature,
    createdAt: new Date().toISOString(),
  });

  return Response.json({ entry, hash, signature });
}
