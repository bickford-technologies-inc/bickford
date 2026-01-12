import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

type BidConfig = {
  customer: string;
  solicitationId: string;
  programName: string;
  pointOfContact: string;
  outputDir: string;
  include: string[];
  exclude: string[];
};

type ManifestEntry = {
  path: string;
  bytes: number;
  sha256: string;
};

function sha256File(absPath: string): { bytes: number; sha256: string } {
  const buf = fs.readFileSync(absPath);
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  return { bytes: buf.byteLength, sha256: hash };
}

function ensureDir(absDir: string) {
  fs.mkdirSync(absDir, { recursive: true });
}

function readJson<T>(absPath: string): T {
  return JSON.parse(fs.readFileSync(absPath, "utf8")) as T;
}

function writeText(absPath: string, content: string) {
  ensureDir(path.dirname(absPath));
  fs.writeFileSync(absPath, content, "utf8");
}

function copyFile(absFrom: string, absTo: string) {
  ensureDir(path.dirname(absTo));
  fs.copyFileSync(absFrom, absTo);
}

function listAllFiles(absDir: string): string[] {
  const out: string[] = [];
  const stack = [absDir];
  while (stack.length) {
    const cur = stack.pop()!;
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const ent of entries) {
      const abs = path.join(cur, ent.name);
      if (ent.isDirectory()) stack.push(abs);
      else if (ent.isFile()) out.push(abs);
    }
  }
  return out;
}

// Very small glob support: ** and * matching on path segments.
function globToRegExp(glob: string): RegExp {
  // normalize to forward slashes
  const g = glob.replace(/\\/g, "/");
  const escaped = g
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*\//g, "(?:.*/)?")
    .replace(/\*\*/g, ".*")
    .replace(/\*/g, "[^/]*");
  return new RegExp(`^${escaped}$`);
}

function matchesAny(relPath: string, globs: string[]): boolean {
  const p = relPath.replace(/\\/g, "/");
  return globs.some((g) => globToRegExp(g).test(p));
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, v);
  }
  return out;
}

function usage(): never {
  // eslint-disable-next-line no-console
  console.error(
    "Usage: tsx scripts/bid/prepare-bid-pack.ts --config bid/bid.config.json [--out bid_out]"
  );
  process.exit(2);
}

function parseArgs(argv: string[]): { configPath: string; outOverride?: string } {
  let configPath = "";
  let outOverride: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--config") configPath = argv[++i] ?? "";
    else if (a === "--out") outOverride = argv[++i];
  }
  if (!configPath) usage();
  return { configPath, outOverride };
}

function resolveInclude(repoRoot: string, include: string[]): string[] {
  const out: string[] = [];
  for (const spec of include) {
    const normalized = spec.replace(/\\/g, "/");
    if (normalized.includes("*") || normalized.includes("?")) {
      // treat as glob
      const all = listAllFiles(repoRoot).map((abs) => path.relative(repoRoot, abs).replace(/\\/g, "/"));
      for (const rel of all) {
        if (matchesAny(rel, [normalized])) out.push(rel);
      }
    } else {
      const abs = path.join(repoRoot, normalized);
      if (!fs.existsSync(abs)) continue;
      const st = fs.statSync(abs);
      if (st.isDirectory()) {
        const files = listAllFiles(abs);
        for (const f of files) out.push(path.relative(repoRoot, f).replace(/\\/g, "/"));
      } else if (st.isFile()) {
        out.push(normalized);
      }
    }
  }
  return Array.from(new Set(out)).sort();
}

function main() {
  const repoRoot = path.resolve(__dirname, "../..");
  const { configPath, outOverride } = parseArgs(process.argv.slice(2));
  const absConfig = path.resolve(repoRoot, configPath);
  const cfg = readJson<BidConfig>(absConfig);

  const outDirRel = outOverride ?? cfg.outputDir;
  const outRoot = path.resolve(repoRoot, outDirRel);

  // clean output dir
  fs.rmSync(outRoot, { recursive: true, force: true });
  ensureDir(outRoot);

  const generatedAt = new Date().toISOString();
  const vars = {
    customer: cfg.customer,
    solicitationId: cfg.solicitationId,
    programName: cfg.programName,
    pointOfContact: cfg.pointOfContact,
    generatedAt,
  };

  const includeFiles = resolveInclude(repoRoot, cfg.include);
  const selected = includeFiles.filter((rel) => !matchesAny(rel, cfg.exclude));

  const manifest: ManifestEntry[] = [];

  for (const rel of selected) {
    const absFrom = path.join(repoRoot, rel);
    const absTo = path.join(outRoot, rel);
    if (!fs.existsSync(absFrom)) continue;
    const st = fs.statSync(absFrom);
    if (!st.isFile()) continue;
    copyFile(absFrom, absTo);
    const { bytes, sha256 } = sha256File(absTo);
    manifest.push({ path: rel.replace(/\\/g, "/"), bytes, sha256 });
  }

  // Generate docs from templates
  const templatesDir = path.join(repoRoot, "bid/templates");
  const readTemplate = (name: string) => fs.readFileSync(path.join(templatesDir, name), "utf8");

  writeText(path.join(outRoot, "COMPLIANCE_MATRIX.md"), renderTemplate(readTemplate("COMPLIANCE_MATRIX.template.md"), vars));
  writeText(path.join(outRoot, "SUBMISSION_CHECKLIST.md"), renderTemplate(readTemplate("SUBMISSION_CHECKLIST.template.md"), vars));
  writeText(path.join(outRoot, "BIDPACK_README.md"), renderTemplate(readTemplate("README_BIDPACK.template.md"), vars));

  // Add generated files to manifest
  for (const relGen of ["COMPLIANCE_MATRIX.md", "SUBMISSION_CHECKLIST.md", "BIDPACK_README.md"]) {
    const absGen = path.join(outRoot, relGen);
    const { bytes, sha256 } = sha256File(absGen);
    manifest.push({ path: relGen, bytes, sha256 });
  }

  manifest.sort((a, b) => a.path.localeCompare(b.path));
  writeText(path.join(outRoot, "MANIFEST.json"), JSON.stringify({ generatedAt, config: cfg, files: manifest }, null, 2) + "\n");

  const shaLines = manifest.map((e) => `${e.sha256}  ${e.path}`).join("\n") + "\n";
  writeText(path.join(outRoot, "MANIFEST.sha256"), shaLines);

  // Convenience bundle (zip is not guaranteed); tar.gz via system tar.
  const tarName = `bickford-bid-pack-${cfg.customer}-${cfg.solicitationId}-${generatedAt.replace(/[:.]/g, "-")}.tar.gz`;
  const tarAbs = path.join(repoRoot, tarName);
  // remove old tar(s) that match prefix
  for (const f of fs.readdirSync(repoRoot)) {
    if (f.startsWith(`bickford-bid-pack-${cfg.customer}-${cfg.solicitationId}-`) && f.endsWith(".tar.gz")) {
      fs.rmSync(path.join(repoRoot, f), { force: true });
    }
  }

  // eslint-disable-next-line no-console
  console.log("Bid pack prepared:");
  // eslint-disable-next-line no-console
  console.log(`- Output dir: ${path.relative(repoRoot, outRoot)}`);
  // eslint-disable-next-line no-console
  console.log(`- Manifest:   ${path.relative(repoRoot, path.join(outRoot, "MANIFEST.json"))}`);
  // eslint-disable-next-line no-console
  console.log(`- Hashes:     ${path.relative(repoRoot, path.join(outRoot, "MANIFEST.sha256"))}`);
  // eslint-disable-next-line no-console
  console.log("\nNext: create an immutable archive with:");
  // eslint-disable-next-line no-console
  console.log(`tar -czf ${tarName} -C ${path.relative(repoRoot, outRoot)} .`);
  // eslint-disable-next-line no-console
  console.log(`sha256sum ${tarName} > ${tarName}.sha256`);
  // Note: we print tar commands rather than running them to keep the script dependency-free.
}

main();
