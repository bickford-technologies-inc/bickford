import fs from "fs";

const trustFile = "CANON/agent-trust.json";
const trust = fs.existsSync(trustFile)
  ? JSON.parse(fs.readFileSync(trustFile, "utf8"))
  : {};

export function decay(agent, amount = 5) {
  trust[agent] = Math.max(0, (trust[agent] ?? 100) - amount);
}

export function reward(agent, amount = 2) {
  trust[agent] = Math.min(100, (trust[agent] ?? 100) + amount);
}

export function evictIfNeeded(agent) {
  if ((trust[agent] ?? 100) < 40) {
    throw new Error(`❌ Agent evicted: ${agent}`);
  }
}

process.on("exit", () => {
  fs.writeFileSync(trustFile, JSON.stringify(trust, null, 2));
});
