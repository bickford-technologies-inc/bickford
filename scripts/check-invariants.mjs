import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();

function fail(msg) {
  console.error(`\n❌ INVARIANT FAILED: ${msg}\n`);
  process.exit(1);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function exists(p) {
  return fs.existsSync(p);
}

function requireFile(p) {
  if (!exists(p)) fail(`Missing required file: ${p}`);
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

function run(cmd) {
  return execSync(cmd, { stdio: "pipe", encoding: "utf8" }).trim();
}

// ---------- 1) vercel.json invariants ----------
const vercelPath = path.join(ROOT, "vercel.json");
if (exists(vercelPath)) {
  const v = readJson(vercelPath);

  if ("functions" in v)
    fail(
      `vercel.json must NOT contain "functions" (App Router routes are framework-owned).`
    );
  if ("outputDirectory" in v)
    fail(
      `vercel.json must NOT contain "outputDirectory" for Next.js (Vercel owns .next).`
    );
  assert(
    v.framework === "nextjs",
    `vercel.json must set {"framework":"nextjs"}.`
  );
}

// ---------- 2) root build must generate prisma then turbo ----------
requireFile(path.join(ROOT, "package.json"));
const rootPkg = readJson(path.join(ROOT, "package.json"));
const build = rootPkg.scripts?.build || "";
assert(
  build.includes("prisma generate") && build.includes("turbo run build"),
  `Root package.json scripts.build must include "prisma generate && turbo run build" (in that order).`
);
assert(
  build.indexOf("prisma generate") < build.indexOf("turbo run build"),
  `Root build script order must be: prisma generate THEN turbo run build.`
);

// ---------- 3) turbo globalEnv must include DATABASE_URL ----------
const turboPath = path.join(ROOT, "turbo.json");
requireFile(turboPath);
const turbo = readJson(turboPath);
const ge = turbo.globalEnv || [];
assert(Array.isArray(ge), `turbo.json globalEnv must be an array.`);
assert(
  ge.includes("DATABASE_URL"),
  `turbo.json globalEnv must include DATABASE_URL.`
);

// ---------- 4) React/@types/react must be single-universe ----------
function npmLs(pkgName) {
  try {
    return run(`npm ls ${pkgName} --json`);
  } catch (e) {
    const out = e?.stdout?.toString?.() || "";
    if (!out) throw e;
    return out;
  }
}

function collectVersions(tree, name, acc = new Map()) {
  if (!tree) return acc;
  const deps = tree.dependencies || {};
  for (const [k, v] of Object.entries(deps)) {
    if (k === name && v.version)
      acc.set(v.version, (acc.get(v.version) || 0) + 1);
    collectVersions(v, name, acc);
  }
  return acc;
}

const reactTypesTree = JSON.parse(npmLs("@types/react"));
const vers = collectVersions(reactTypesTree, "@types/react");
assert(
  vers.size === 1,
  `Multiple @types/react versions detected: ${JSON.stringify(
    Object.fromEntries(vers)
  )}`
);

const reactTree = JSON.parse(npmLs("react"));
const reactVers = collectVersions(reactTree, "react");
assert(
  reactVers.size === 1,
  `Multiple react versions detected: ${JSON.stringify(
    Object.fromEntries(reactVers)
  )}`
);

// ---------- 5) Workspaces must NOT declare @types/react locally ----------
const workspaces = rootPkg.workspaces || [];
function globToDirs(glob) {
  if (!glob.endsWith("/*")) return [];
  const base = glob.slice(0, -2);
  const full = path.join(ROOT, base);
  if (!exists(full)) return [];
  return fs
    .readdirSync(full, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(full, d.name));
}

const workspaceDirs = workspaces.flatMap(globToDirs);

for (const dir of workspaceDirs) {
  const pkgPath = path.join(dir, "package.json");
  if (!exists(pkgPath)) continue;
  const pkg = readJson(pkgPath);
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  if ("@types/react" in deps || "@types/react-dom" in deps) {
    fail(
      `Workspace ${path.relative(
        ROOT,
        dir
      )} must NOT declare @types/react or @types/react-dom (root-only invariant).`
    );
  }
}

console.log("✅ All invariants satisfied.");
