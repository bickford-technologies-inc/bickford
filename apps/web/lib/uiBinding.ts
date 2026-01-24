import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { readProofLedger } from "@bickford/ledger";

const UI_FILES = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/chat/page.tsx",
  "app/canon-dag/page.tsx",
  "app/decision-trace-viewer/page.tsx",
];

const CSS_FILES = ["app/globals.css"];

const LEDGER_INTENT_ID = "UI_BINDING";
const LEDGER_KIND = "UI_BINDING";

type UiHashSnapshot = {
  uiHash: string;
  cssHash: string;
  combinedHash: string;
  uiFiles: string[];
  cssFiles: string[];
};

type UiLedgerPayload = {
  uiHash?: string;
  cssHash?: string;
  combinedHash?: string;
  surface?: string;
};

type UiBindingEntry = ReturnType<typeof readProofLedger>[number];

function hashSha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function resolveWebRoot() {
  const candidates = [
    process.cwd(),
    path.resolve(process.cwd(), "apps", "web"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "app", "layout.tsx"))) {
      return candidate;
    }
  }

  return path.resolve(process.cwd(), "apps", "web");
}

function readFiles(root: string, files: string[]) {
  return files.map((file) => {
    const fullPath = path.join(root, file);
    return { path: file, content: fs.readFileSync(fullPath, "utf8") };
  });
}

export function computeUiSurfaceHashes(): UiHashSnapshot {
  const root = resolveWebRoot();
  const uiFiles = readFiles(root, UI_FILES);
  const cssFiles = readFiles(root, CSS_FILES);
  const uiHash = hashSha256(JSON.stringify(uiFiles));
  const cssHash = hashSha256(JSON.stringify(cssFiles));
  const combinedHash = hashSha256(`${uiHash}::${cssHash}`);

  return {
    uiHash,
    cssHash,
    combinedHash,
    uiFiles: UI_FILES,
    cssFiles: CSS_FILES,
  };
}

export function getLatestUiBinding(): UiBindingEntry | null {
  const entries = readProofLedger(LEDGER_INTENT_ID)
    .filter((entry) => entry.kind === LEDGER_KIND)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return entries.at(-1) ?? null;
}

export async function assertUiLedgerBinding(options?: {
  required?: boolean;
}) {
  if (options?.required === false) {
    return;
  }
  if (
    process.env.VERCEL ||
    process.env.CI ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return;
  }

  const current = computeUiSurfaceHashes();
  const entry = getLatestUiBinding();

  if (!entry) {
    throw new Error(
      "UI_BINDING_MISSING: No UI binding ledger entry found for runtime surface.",
    );
  }

  const payload = entry.payload as UiLedgerPayload;
  const uiMatches = payload.uiHash === current.uiHash;
  const cssMatches = payload.cssHash === current.cssHash;
  const combinedMatches = payload.combinedHash === current.combinedHash;

  if (!uiMatches || !cssMatches || !combinedMatches) {
    throw new Error(
      `UI_BINDING_MISMATCH: ui=${uiMatches} css=${cssMatches} combined=${combinedMatches}`,
    );
  }
}

export const uiLedgerConstants = {
  intentId: LEDGER_INTENT_ID,
  kind: LEDGER_KIND,
};
