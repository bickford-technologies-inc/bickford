import { requireSamGovApiKey, samgovGetJson } from "./client";

type SearchResponse = any;

function formatDateYYYYMMDD(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateMMDDYYYY(d: Date): string {
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function normalizePostedDateArg(s: string): string {
  const v = (s || "").trim();
  if (!v) return v;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return v;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const d = new Date(v + "T00:00:00Z");
    if (!Number.isNaN(d.getTime())) return formatDateMMDDYYYY(d);
  }
  throw new Error("Invalid date. Use YYYY-MM-DD or MM/dd/yyyy.");
}

function usage(): never {
  // eslint-disable-next-line no-console
  console.error(
    "Usage: tsx scripts/samgov/search-opportunities.ts --q <query> [--postedFrom YYYY-MM-DD|MM/dd/yyyy] [--postedTo YYYY-MM-DD|MM/dd/yyyy] [--limit 10] [--offset 0] [--baseUrl https://api.sam.gov/prod]"
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
  if (!out.q) usage();
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = requireSamGovApiKey();

  // NOTE: Endpoint may evolve; keep it configurable.
  // Common current shape is /opportunities/v2/search under https://api.sam.gov/prod
  const baseUrl = args.baseUrl;

  const limit = args.limit ? Number(args.limit) : 10;
  const offset = args.offset ? Number(args.offset) : 0;

  // SAM.gov requires postedFrom/postedTo for opportunities search.
  const postedTo = normalizePostedDateArg(args.postedTo || formatDateMMDDYYYY(new Date()));
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - 30);
  const postedFrom = normalizePostedDateArg(args.postedFrom || formatDateMMDDYYYY(from));

  const json = await samgovGetJson<SearchResponse>(
    "/opportunities/v2/search",
    { q: args.q, limit, offset, postedFrom, postedTo },
    { apiKey, baseUrl }
  );

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(json, null, 2));
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e?.message ?? e);
  process.exit(1);
});
