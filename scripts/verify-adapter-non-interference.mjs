import { execSync } from "child_process";
import fs from "fs";

const adapters = [
  { name: "cli", cmd: "node dist/adapters/cli/index.js" },
  { name: "docker", cmd: "node dist/adapters/docker/index.js" },
];

const hashes = {};

for (const adapter of adapters) {
  const output = execSync(adapter.cmd, {
    env: { ...process.env, BICKFORD_CAPTURE_HASH: "1" },
  }).toString();

  const match = output.match(/HASH:([a-f0-9]{64})/);
  if (!match) {
    console.error(`❌ ${adapter.name} did not emit hash`);
    process.exit(1);
  }

  hashes[adapter.name] = match[1];
}

const unique = new Set(Object.values(hashes));

if (unique.size !== 1) {
  console.error("❌ ADAPTER NON-INTERFERENCE VIOLATION");
  console.error(hashes);
  process.exit(1);
}

console.log("✅ Adapter non-interference verified");
