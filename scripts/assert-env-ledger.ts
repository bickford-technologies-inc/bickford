import fs from "fs"
import crypto from "crypto"
import { envLedger } from "../packages/bickford/src/runtime/envLedger"

const currentHash = fs.readFileSync("infra/env/env.hash", "utf8").trim()
const last = envLedger.at(-1)

if (!last || last.newHash !== currentHash) {
  console.error("❌ Env hash changed without ledger entry")
  process.exit(1)
}

console.log("✅ Env mutation is ledger-backed")
