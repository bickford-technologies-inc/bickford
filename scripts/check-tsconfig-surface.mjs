import fs from "fs";
import path from "path";
import process from "process";

const ROOT = process.cwd();
const ROOT_TSCONFIG = path.join(ROOT, "tsconfig.base.json");

const FORBIDDEN_COMPILER_OPTIONS = new Set([
  "target",
  "module",
  "moduleResolution",
  "strict",
  "skipLibCheck",
  "baseUrl",
  "paths",
  "lib",
  "jsx",
  "types",
  "plugins"
]);

function findTsconfigs(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findTsconfigs(fullPath, results);
    } else if (entry.isFile() && entry.name === "tsconfig.json") {
      results.push(fullPath);
    }
  }
  return results;
}

function fail(msg) {
  console.error(`\n❌ TSConfig Surface Violation\n${msg}\n`);
  process.exit(1);
}

const tsconfigs = findTsconfigs(ROOT);

for (const file of tsconfigs) {
  if (path.resolve(file) === ROOT_TSCONFIG) continue;

  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  const opts = json.compilerOptions ?? {};

  for (const key of Object.keys(opts)) {
    if (FORBIDDEN_COMPILER_OPTIONS.has(key)) {
      fail(
        `${file} declares forbidden compiler option "${key}".\n` +
        `Compiler policy must live in tsconfig.base.json.\n\n` +
        `Allowed locally: rootDir, outDir, composite, declaration only.`
      );
    }
  }

  if (!json.extends) {
    fail(
      `${file} does not declare "extends".\n` +
      `All leaf tsconfigs must extend tsconfig.base.json.`
    );
  }
}

console.log("✅ TSConfig surface is valid");
