#!/usr/bin/env node
import fs from "fs";
import glob from "fast-glob";

const files = glob.sync("**/*.{ts,tsx,js}", {
  ignore: ["**/node_modules/**", "**/dist/**"],
});

const bad = files.filter((f) =>
  fs.readFileSync(f, "utf8").includes("process.env")
);

if (bad.length) {
  console.error("❌ process.env used at build time:");
  bad.forEach((f) => console.error(" ", f));
  process.exit(1);
}
