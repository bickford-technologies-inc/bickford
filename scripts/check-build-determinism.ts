#!/usr/bin/env node

import fs from "fs";
import crypto from "crypto";
import glob from "fast-glob";

function hashFile(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

const files = glob.sync("dist/**/*", {
  onlyFiles: true,
  ignore: ["**/build.json"],
});

const manifest = {};

for (const f of files) {
  manifest[f] = hashFile(f);
}

fs.writeFileSync(
  "dist/manifest.json",
  JSON.stringify(manifest, null, 2) + "\n"
);

console.log("✅ build manifest written");
