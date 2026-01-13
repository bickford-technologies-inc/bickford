#!/usr/bin/env node
import fs from "fs";
import path from "path";
import glob from "glob";

const ROOT = process.cwd();

const ILLEGAL = /@bickford\/bickford\/src\/canon[^'"`]*/g;

const files = glob.sync("**/*.{ts,tsx}", {
  cwd: ROOT,
  ignore: ["node_modules/**", "dist/**", ".turbo/**"],
});

let count = 0;

for (const file of files) {
  const abs = path.join(ROOT, file);
  const src = fs.readFileSync(abs, "utf8");
  if (ILLEGAL.test(src)) {
    const fixed = src.replace(ILLEGAL, "@bickford/types");
    fs.writeFileSync(abs, fixed);
    count++;
  }
}

console.log(`✅ Fixed illegal canon source imports in ${count} files`);
