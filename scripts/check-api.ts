#!/usr/bin/env node

import fs from "fs";
import path from "path";

function load(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function diff(oldApi, nextApi) {
  const errors = [];

  for (const key of Object.keys(oldApi)) {
    if (!(key in nextApi)) {
      errors.push(`❌ Removed export: ${key}`);
      continue;
    }
    if (oldApi[key] !== nextApi[key]) {
      errors.push(
        `❌ Breaking change in ${key}\n   before: ${oldApi[key]}\n   after:  ${nextApi[key]}`
      );
    }
  }

  return errors;
}

const pkg = process.argv[2];
if (!pkg) throw new Error("package required");

const apiPath = path.join("packages", pkg, "api", "public.api.json");
const nextPath = path.join("packages", pkg, "api", "next.api.json");

const oldApi = load(apiPath);
const nextApi = load(nextPath);

const errors = diff(oldApi, nextApi);

if (errors.length) {
  console.error("❌ API BREAKING CHANGES DETECTED:");
  errors.forEach((e) => console.error(e));
  process.exit(1);
}

console.log("✅ API compatibility preserved");
