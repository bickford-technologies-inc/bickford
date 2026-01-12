import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { requireSamGovApiKey, samgovGetJson } from "./client";

type ManifestEntry = { path: string; bytes: number; sha256: string };

type Manifest = {
  generatedAt: string;
  config: unknown;
  files: ManifestEntry[];
};

function usage(): never {
  // eslint-disable-next-line no-console
  console.error(
    "Usage: tsx scripts/samgov/enrich-bid-out.ts --noticeId <ID> [--out bid_out] [--baseUrl https://api.sam.gov/prod]"
  );
  process.exit(2);
}

function parseArgs(argv: string[]) {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    out[a.slice(2)] = argv[i + 1] ?? "";
    i++;
  }
  if (!out.noticeId) usage();
  return out;
}

function sha256File(absPath: string): { bytes: number; sha256: string } {
  const buf = fs.readFileSync(absPath);
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  return { bytes: buf.byteLength, sha256: hash };
}

function writeJson(absPath: string, obj: unknown) {
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function readManifest(outRoot: string): Manifest {
  const abs = path.join(outRoot, "MANIFEST.json");
  if (!fs.existsSync(abs)) {
    throw new Error(`Missing ${path.relative(process.cwd(), abs)}. Run bid pack generation first.`);
  }
  return JSON.parse(fs.readFileSync(abs, "utf8")) as Manifest;
}

function writeManifest(outRoot: string, manifest: Manifest) {
  const abs = path.join(outRoot, "MANIFEST.json");
  fs.writeFileSync(abs, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  const shaLines = manifest.files
    .slice()
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((e) => `${e.sha256}  ${e.path}`)
    .join("\n") + "\n";

  fs.writeFileSync(path.join(outRoot, "MANIFEST.sha256"), shaLines, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = requireSamGovApiKey();
  const baseUrl = args.baseUrl;

  const outRoot = path.resolve(process.cwd(), args.out ?? "bid_out");
  const manifest = readManifest(outRoot);

  const notice = await samgovGetJson<any>(
    "/opportunities/v2/notice",
    { noticeId: args.noticeId },
    { apiKey, baseUrl }
  );

  const relNoticePath = "samgov/notice.json";
  const absNoticePath = path.join(outRoot, relNoticePath);
  writeJson(absNoticePath, notice);

  const { bytes, sha256 } = sha256File(absNoticePath);

  const existingIdx = manifest.files.findIndex((f) => f.path === relNoticePath);
  const entry: ManifestEntry = { path: relNoticePath, bytes, sha256 };
  if (existingIdx >= 0) manifest.files[existingIdx] = entry;
  else manifest.files.push(entry);

  // Update manifest timestamp to reflect enrichment.
  manifest.generatedAt = new Date().toISOString();

  writeManifest(outRoot, manifest);

  // eslint-disable-next-line no-console
  console.log(`Wrote ${path.relative(process.cwd(), absNoticePath)}`);
  // eslint-disable-next-line no-console
  console.log(`Updated ${path.relative(process.cwd(), path.join(outRoot, "MANIFEST.json"))}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e?.message ?? e);
  process.exit(1);
});
