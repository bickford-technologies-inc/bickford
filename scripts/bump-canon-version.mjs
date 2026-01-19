import fs from "fs";

const canonPath = "CANON/CANON.md";
const canon = fs.readFileSync(canonPath, "utf8");

const match = canon.match(/version:\s*([0-9]+\.[0-9]+\.[0-9]+)/);
if (!match) process.exit(0);

const [major, minor, patch] = match[1].split(".").map(Number);
const next = `${major}.${minor}.${patch + 1}`;

const updated = canon.replace(match[0], `version: ${next}`);
fs.writeFileSync(canonPath, updated);

console.log(`📦 Canon version bumped → ${next}`);
