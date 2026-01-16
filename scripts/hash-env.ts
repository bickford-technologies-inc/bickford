import crypto from "crypto";
import fs from "fs";

const schema = JSON.parse(fs.readFileSync("infra/env/schema.json", "utf8"));

const values: Record<string, string> = {};

for (const key of Object.keys(schema.required)) {
  const val = process.env[key];
  if (!val) {
    console.error(`❌ Missing env var: ${key}`);
    process.exit(1);
  }
  values[key] = val;
}

const canonical = JSON.stringify(values, Object.keys(values).sort());
const hash = crypto.createHash("sha256").update(canonical).digest("hex");

fs.writeFileSync("infra/env/env.hash", hash + "\n");
console.log("✅ Env hash:", hash);
