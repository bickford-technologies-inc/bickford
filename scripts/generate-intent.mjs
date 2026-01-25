#!/usr/bin/env bun
import fs from "fs";

const intentPath = "intent.json";

const intent = {
  id: `build-${new Date().toISOString().replace(/[:.]/g, "-")}`,
  action: "full-build",
  created_at: new Date().toISOString(),
  actor: process.env.USER || process.env.USERNAME || "unknown",
  description: "Automated build intent for Bickford+Bun+TypeScript pipeline.",
};

fs.writeFileSync(intentPath, JSON.stringify(intent, null, 2));
console.log(`Intent file generated: ${intentPath}`);
