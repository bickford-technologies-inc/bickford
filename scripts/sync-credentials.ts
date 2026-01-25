// scripts/sync-credentials.ts
// Sync agent: fetches credentials from credential-authority and writes to .env
import { getCredential } from "../packages/credential-authority/index";
import { writeFileSync, existsSync, readFileSync } from "fs";

const ENV_PATH = ".env";
const CREDENTIALS = ["ANTHROPIC_API_KEY", "DATABASE_URL", "BICKFORD_API_TOKEN"];

function syncCredentials() {
  let env = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  let lines = env.split("\n").filter(Boolean);
  let envMap = Object.fromEntries(lines.map((l) => l.split("=", 2)));
  let changed = false;
  for (const name of CREDENTIALS) {
    const rec = getCredential(name);
    if (rec && envMap[name] !== rec.value) {
      envMap[name] = rec.value;
      changed = true;
    }
  }
  if (changed) {
    const out = Object.entries(envMap)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    writeFileSync(ENV_PATH, out + "\n");
    console.log("[sync-credentials] .env updated");
  } else {
    console.log("[sync-credentials] .env already up to date");
  }
}

syncCredentials();
