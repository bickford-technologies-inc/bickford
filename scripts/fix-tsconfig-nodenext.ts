#!/usr/bin/env node
import fs from "fs";
import path from "path";
import glob from "glob";

const files = glob.sync("**/tsconfig.json", {
  ignore: ["node_modules/**", "dist/**"],
});

for (const f of files) {
  const json = JSON.parse(fs.readFileSync(f, "utf8"));
  json.compilerOptions ||= {};
  json.compilerOptions.module = "NodeNext";
  json.compilerOptions.moduleResolution = "NodeNext";
  fs.writeFileSync(f, JSON.stringify(json, null, 2));
}

console.log("✅ Enforced NodeNext across all tsconfigs");
