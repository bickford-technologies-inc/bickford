import fs from "node:fs";
import path from "node:path";
import { requireSamGovApiKey, samgovGetJson } from "./client";

type NoticeResponse = any;

function usage(): never {
  // eslint-disable-next-line no-console
  console.error(
    "Usage: tsx scripts/samgov/fetch-notice.ts --noticeId <id> [--out bid_out/samgov/notice.json] [--baseUrl https://api.sam.gov/prod]"
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = requireSamGovApiKey();
  const baseUrl = args.baseUrl;
  const outPath = args.out ?? "bid_out/samgov/notice.json";

  // NOTE: This endpoint may evolve. Many SAM.gov opportunity APIs support fetching by noticeId.
  const json = await samgovGetJson<NoticeResponse>(
    "/opportunities/v2/notice",
    { noticeId: args.noticeId },
    { apiKey, baseUrl }
  );

  const absOut = path.resolve(process.cwd(), outPath);
  fs.mkdirSync(path.dirname(absOut), { recursive: true });
  fs.writeFileSync(absOut, JSON.stringify(json, null, 2) + "\n", "utf8");

  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e?.message ?? e);
  process.exit(1);
});
