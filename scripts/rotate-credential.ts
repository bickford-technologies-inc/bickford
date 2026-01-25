// scripts/rotate-credential.ts
// Rotate a credential and sync all environments (MVP)
import { rotateCredential } from "../packages/credential-authority/index";
import { execSync } from "child_process";
import { updateIntentsOnCredentialRotation } from "../packages/credential-authority/optr-integration";
import { logCredentialEvent } from "../packages/ledger/credential-events";

const [, , name, value] = process.argv;
if (!name || !value) {
  console.error(
    "Usage: bun run scripts/rotate-credential.ts <NAME> <NEW_VALUE>",
  );
  process.exit(1);
}

const rec = rotateCredential(name, value);
console.log(`[rotate-credential] Rotated ${name} to version ${rec.version}`);

// Sync to .env (local MVP)
execSync("bun run scripts/sync-credentials.ts", { stdio: "inherit" });

// OPTR update
const affectedIntents = updateIntentsOnCredentialRotation(name, rec.version);

// Ledger event
logCredentialEvent({
  type: "rotate",
  name,
  version: rec.version,
  intentIds: affectedIntents,
});
