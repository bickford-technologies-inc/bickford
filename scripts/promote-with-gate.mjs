#!/usr/bin/env node
import fs from "fs";

const history = JSON.parse(
  fs.readFileSync("canon/invariant-history.json", "utf8"),
);

const recentFailures = history.filter(
  (h) => Date.now() - new Date(h.timestamp).getTime() < 7 * 86400000,
);

if (recentFailures.length) {
  console.error("❌ Promotion blocked due to recent invariant failures:");
  recentFailures.forEach((f) =>
    console.error(`- ${f.invariant} (${f.package})`),
  );
  process.exit(1);
}

console.log("✅ Promotion gate passed");
