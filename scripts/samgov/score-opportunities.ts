import fs from "node:fs";
import path from "node:path";
import { SamGovError, requireSamGovApiKey, samgovGetJson } from "./client";

type Json = any;

type ScoreBreakdown = {
  total: number;
  eligibility: number;
  technicalFit: number;
  strategicValue: number;
  bidFriction: number;
  risk: number;
  notes: string[];
};

type ScoredOpportunity = {
  noticeId: string;
  title?: string;
  solicitationNumber?: string;
  agency?: string;
  postedDate?: string;
  responseDeadLine?: string;
  contactEmail?: string;
  score: ScoreBreakdown;
  notice?: Json;
};

type Profile = {
  name: string;
  oneLine: string;
  contact: { fromName: string; fromEmail: string; replyTo?: string };
  capabilities: { keywords: string[]; negativeKeywords?: string[] };
  eligibility: { setAsides?: string[]; naics?: string[]; psc?: string[] };
  commercial: { minEstimatedValueUsd?: number; maxBidEffortHours?: number; minDaysToDeadline?: number };
};

type ScoringConfig = {
  version: number;
  weights: {
    eligibility: number;
    technicalFit: number;
    strategicValue: number;
    bidFriction: number;
    risk: number;
  };
  eligibility?: {
    requireSetAsideMatch?: boolean;
    requireNaicsMatch?: boolean;
    requirePscMatch?: boolean;
  };
  technicalFit?: {
    keywordHitCap?: number;
    keywordWeightPerHit?: number;
    negativeKeywordPenalty?: number;
  };
  bidFriction?: {
    deadline?: { minDaysFullScore?: number; minDaysZeroScore?: number };
  };
  risk?: {
    unknownFieldPenalty?: number;
    maxUnknownPenalty?: number;
  };
};

function usage(): never {
  // eslint-disable-next-line no-console
  console.error(
    [
      "Usage:",
      "  tsx scripts/samgov/score-opportunities.ts --q <query> [--postedFrom YYYY-MM-DD|MM/dd/yyyy] [--postedTo YYYY-MM-DD|MM/dd/yyyy]",
      "    [--limit 25] [--offset 0] [--pages 1] [--maxResults 1000] [--rateLimitMs 600] [--appendSearch 1] [--acceptingBids 1] [--threshold 90] [--out out/samgov]",
      "    [--profile bid/scoring/bickford.profile.json] [--config bid/scoring/scoring.config.json]",
      "    [--fetchNotices 1] [--baseUrl https://api.sam.gov/prod]",
      "  Option B1 (offline from CSV):",
      "    tsx scripts/samgov/score-opportunities.ts --csv <export.csv> [--acceptingBids 1] [--threshold 90] [--out out/samgov]",
      "  Offline scoring:",
      "    tsx scripts/samgov/score-opportunities.ts --in out/samgov/search.json --out out/samgov",
    ].join("\n")
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
  if (!out.q && !out.in && !out.csv) usage();
  return out;
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

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

function writeJson(p: string, v: unknown) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n", "utf8");
}

function parseCsv(content: string): string[][] {
  // Minimal RFC4180-ish parser: supports quoted fields, escaped quotes, commas, and CRLF.
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    // Drop trailing completely-empty line.
    if (row.length === 1 && row[0] === "" && rows.length === 0) {
      row = [];
      return;
    }
    rows.push(row);
    row = [];
  };

  while (i < content.length) {
    const ch = content[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = content[i + 1];
        if (next === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === ",") {
      pushField();
      i++;
      continue;
    }

    if (ch === "\n") {
      pushField();
      pushRow();
      i++;
      continue;
    }

    if (ch === "\r") {
      // Handle CRLF.
      if (content[i + 1] === "\n") {
        pushField();
        pushRow();
        i += 2;
        continue;
      }
      pushField();
      pushRow();
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // Flush trailing field/row.
  pushField();
  if (row.some((x) => x !== "")) pushRow();
  return rows;
}

function normalizeHeader(s: string): string {
  return (s || "")
    .trim()
    .toLowerCase()
    .replaceAll("\uFEFF", "")
    .replaceAll(/\s+/g, " ");
}

function indexHeaders(headers: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < headers.length; i++) {
    const key = normalizeHeader(headers[i]);
    if (!key) continue;
    if (!map.has(key)) map.set(key, i);
  }
  return map;
}

function getCol(row: string[], headerIndex: Map<string, number>, names: string[]): string {
  for (const n of names) {
    const idx = headerIndex.get(normalizeHeader(n));
    if (idx === undefined) continue;
    const v = row[idx] ?? "";
    if (typeof v === "string") return v.trim();
  }
  return "";
}

function truthyYesNo(v: string): boolean | undefined {
  const s = (v || "").trim().toLowerCase();
  if (!s) return undefined;
  if (["yes", "y", "true", "1"].includes(s)) return true;
  if (["no", "n", "false", "0"].includes(s)) return false;
  return undefined;
}

function mapCsvRowToNotice(row: string[], headerIndex: Map<string, number>): any {
  // Canonical Option B1 mapping (SAM-like notice object) — designed to match what scoreOpportunity() reads.
  const noticeId = getCol(row, headerIndex, ["NoticeId", "noticeId", "Notice ID", "id"]);
  const title = getCol(row, headerIndex, ["Title", "title"]);
  const description = getCol(row, headerIndex, ["Description", "description", "Synopsis"]);
  const solicitationNumber = getCol(row, headerIndex, ["Sol#", "Sol #", "SolicitationNumber", "solicitationNumber"]);

  const agency = getCol(row, headerIndex, ["Department/Ind.Agency", "Department", "Agency", "Department/Ind Agency"]);
  const subTier = getCol(row, headerIndex, ["Sub-Tier", "Sub Tier"]);
  const office = getCol(row, headerIndex, ["Office", "Office Name"]);

  const postedDate = getCol(row, headerIndex, ["PostedDate", "Posted Date", "postedDate"]);
  const responseDeadLine = getCol(row, headerIndex, ["ResponseDeadLine", "Response DeadLine", "Response Deadline", "responseDeadLine"]);

  const naicsCode = getCol(row, headerIndex, ["NaicsCode", "NAICS", "naicsCode"]);
  const pscCode = getCol(row, headerIndex, ["ClassificationCode", "PSC", "pscCode", "classificationCode"]);

  const setAside = getCol(row, headerIndex, ["SetASide", "SetAside", "Set Aside", "typeOfSetAside"]);
  const setAsideCode = getCol(row, headerIndex, ["SetASideCode", "SetAsideCode", "Set Aside Code"]);

  const activeRaw = getCol(row, headerIndex, ["Active", "active", "IsActive", "isActive"]);
  const archiveType = getCol(row, headerIndex, ["ArchiveType", "archiveType"]);
  const archiveDate = getCol(row, headerIndex, ["ArchiveDate", "archiveDate"]);
  const type = getCol(row, headerIndex, ["Type", "type", "NoticeType", "noticeType"]);

  const primaryEmail = getCol(row, headerIndex, ["PrimaryContactEmail", "Primary Contact Email", "pointOfContactEmail"]);
  const secondaryEmail = getCol(row, headerIndex, ["SecondaryContactEmail", "Secondary Contact Email"]);
  const contactEmail = primaryEmail || secondaryEmail;

  const isActive = truthyYesNo(activeRaw);

  return {
    noticeId: noticeId || solicitationNumber || title,
    title: title || undefined,
    description: description || undefined,
    solicitationNumber: solicitationNumber || undefined,
    postedDate: postedDate || undefined,
    responseDeadLine: responseDeadLine || undefined,

    // Agency fields (your scorer checks agency/department/office for strategicValue + textFromNotice).
    agency: agency || undefined,
    department: agency || undefined,
    office: office || undefined,
    subTier: subTier || undefined,

    // Eligibility + text fields.
    naicsCode: naicsCode || undefined,
    naics: naicsCode || undefined,
    pscCode: pscCode || undefined,
    psc: pscCode || undefined,
    classificationCode: pscCode || undefined,

    typeOfSetAside: setAside || setAsideCode || undefined,
    setAside: setAside || undefined,
    setAsideType: setAside || setAsideCode || undefined,

    // Status-ish fields (used by isAcceptingBids fallback heuristics).
    active: activeRaw || undefined,
    isActive: isActive,
    archiveType: archiveType || undefined,
    archiveDate: archiveDate || undefined,
    type: type || undefined,
    noticeType: type || undefined,

    // Contact
    pointOfContactEmail: contactEmail || undefined,
    primaryContactEmail: primaryEmail || undefined,
  };
}

function safeString(v: unknown): string {
  if (typeof v === "string") return v;
  return "";
}

function parseDate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function daysUntil(deadlineIso?: string): number | null {
  const d = parseDate(deadlineIso);
  if (!d) return null;
  const now = new Date();
  const ms = d.getTime() - now.getTime();
  return Math.floor(ms / (24 * 3600 * 1000));
}

function normalizeStatus(v: unknown): string {
  const s = safeString(v).trim();
  return s.toLowerCase();
}

function isAcceptingBids(notice: any): boolean {
  // Primary signal: response deadline in the future.
  const deadline = safeString(notice?.responseDeadLine ?? notice?.responseDeadline ?? notice?.responseDate);
  const d = daysUntil(deadline);
  if (d !== null) return d >= 0;

  // Fallback: status fields. SAM.gov shapes vary.
  const statusFields: unknown[] = [
    notice?.opportunityStatus,
    notice?.noticeStatus,
    notice?.status,
    notice?.active,
    notice?.isActive,
    notice?.type,
    notice?.noticeType,
  ];

  const statuses = statusFields
    .flatMap((x) => (Array.isArray(x) ? x : [x]))
    .map((x) => (typeof x === "boolean" ? (x ? "active" : "inactive") : normalizeStatus(x)))
    .filter(Boolean);

  const joined = statuses.join(" |");
  // Negative terminal states.
  const closedSignals = ["cancel", "canceled", "cancelled", "award", "awarded", "closed", "expired", "archive"];
  if (closedSignals.some((s) => joined.includes(s))) return false;

  // Positive signals.
  const openSignals = ["open", "active", "posted", "solicitation", "request for", "rfp", "rfi", "sources sought"];
  if (openSignals.some((s) => joined.includes(s))) return true;

  // If we can't tell, treat as not accepting bids to avoid spam.
  return false;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function extractSearchItems(json: any): any[] {
  if (!json) return [];
  const candidates: any[] = [];
  const directArrays = [
    json.opportunitiesData,
    json.opportunities,
    json.data,
    json.results,
    json.items,
    json.opportunityData,
  ];
  for (const arr of directArrays) {
    if (Array.isArray(arr)) return arr;
    if (Array.isArray(arr?.data)) return arr.data;
    if (Array.isArray(arr?.items)) return arr.items;
  }

  // Heuristic deep scan (bounded)
  const stack = [json];
  let steps = 0;
  while (stack.length && steps++ < 2000) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;
    for (const v of Object.values(cur)) {
      if (Array.isArray(v) && v.length && typeof v[0] === "object") {
        candidates.push(v);
      } else if (v && typeof v === "object") {
        stack.push(v);
      }
    }
  }

  // Pick the largest object array
  candidates.sort((a, b) => b.length - a.length);
  return candidates[0] ?? [];
}

function pickNoticeId(item: any): string | null {
  const keys = ["noticeId", "notice_id", "id", "opportunityId", "opportunity_id"];
  for (const k of keys) {
    const v = item?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  // Sometimes only solicitation number exists; still usable as stable key.
  const sol = item?.solicitationNumber ?? item?.solNum ?? item?.solicitation_number;
  if (typeof sol === "string" && sol.trim()) return sol.trim();
  return null;
}

function normalizeText(s: string): string {
  return s.toLowerCase();
}

function keywordMatchScore(text: string, keyword: string): number {
  const k = keyword.trim().toLowerCase();
  if (!k) return 0;
  if (text.includes(k)) return 1;

  // Partial credit for multi-word phrases when words appear separately.
  const toks = k.split(/\s+/).filter(Boolean);
  if (toks.length >= 2) {
    const hits = toks.filter((t) => text.includes(t)).length;
    if (hits === toks.length) return 0.6;
    if (hits > 0) return 0.2;
  }

  return 0;
}

function textFromNotice(notice: any): string {
  const parts: string[] = [];
  const push = (v: unknown) => {
    if (typeof v === "string" && v.trim()) parts.push(v);
  };

  push(notice?.title);
  push(notice?.description);
  push(notice?.additionalInfo);
  push(notice?.type);
  push(notice?.noticeType);
  push(notice?.classificationCode);
  push(notice?.naicsCode);
  push(notice?.naics);
  push(notice?.pscCode);
  push(notice?.psc);
  push(notice?.agency);
  push(notice?.office);
  push(notice?.department);

  return normalizeText(parts.join("\n"));
}

function extractContactEmail(notice: any): string | undefined {
  const candidates: unknown[] = [
    notice?.pointOfContactEmail,
    notice?.contactEmail,
    notice?.email,
    notice?.primaryContactEmail,
    notice?.pointOfContact?.email,
  ];

  if (Array.isArray(notice?.pointOfContact)) {
    for (const p of notice.pointOfContact) {
      candidates.push(p?.email);
      candidates.push(p?.contactEmail);
    }
  }

  for (const c of candidates) {
    const s = safeString(c).trim();
    if (s.includes("@")) return s;
  }
  return undefined;
}

function scoreOpportunity(profile: Profile, config: ScoringConfig, notice: any): ScoreBreakdown {
  const w = config.weights;
  const notes: string[] = [];

  const text = textFromNotice(notice);

  // --- Eligibility (0..w.eligibility) ---
  const hasEligibilityConfig =
    (profile.eligibility?.setAsides?.length ?? 0) > 0 ||
    (profile.eligibility?.naics?.length ?? 0) > 0 ||
    (profile.eligibility?.psc?.length ?? 0) > 0;

  // If eligibility isn't configured, don't let it inflate the score.
  // You can tighten this later by setting require*Match and/or adding allowlists.
  let eligibility = hasEligibilityConfig ? w.eligibility : Math.round(w.eligibility * 0.33);
  const setAside = safeString(notice?.typeOfSetAside ?? notice?.setAside ?? notice?.setAsideType);
  const naics = safeString(notice?.naicsCode ?? notice?.naics);
  const psc = safeString(notice?.pscCode ?? notice?.psc);

  const requireSetAsideMatch = !!config.eligibility?.requireSetAsideMatch;
  const requireNaicsMatch = !!config.eligibility?.requireNaicsMatch;
  const requirePscMatch = !!config.eligibility?.requirePscMatch;

  if (profile.eligibility?.setAsides?.length) {
    const match = profile.eligibility.setAsides.some((s) => s.toLowerCase() === setAside.toLowerCase());
    if (!match) {
      notes.push(`Set-aside mismatch (${setAside || "unknown"}).`);
      if (requireSetAsideMatch) eligibility = 0;
      else eligibility -= 6;
    }
  } else {
    notes.push("No set-aside eligibility configured in profile (neutral). Consider adding if applicable.");
  }

  if (profile.eligibility?.naics?.length && naics) {
    const match = profile.eligibility.naics.includes(naics);
    if (!match) {
      notes.push(`NAICS mismatch (${naics}).`);
      if (requireNaicsMatch) eligibility = 0;
      else eligibility -= 6;
    }
  } else {
    notes.push("No NAICS eligibility configured or NAICS missing in notice (neutral). Consider adding NAICS allowlist.");
  }

  if (profile.eligibility?.psc?.length && psc) {
    const match = profile.eligibility.psc.includes(psc);
    if (!match) {
      notes.push(`PSC mismatch (${psc}).`);
      if (requirePscMatch) eligibility = 0;
      else eligibility -= 4;
    }
  } else {
    notes.push("No PSC eligibility configured or PSC missing in notice (neutral). Consider adding PSC allowlist.");
  }

  eligibility = clamp(eligibility, 0, w.eligibility);

  // --- Technical fit (0..w.technicalFit) ---
  const hitCap = config.technicalFit?.keywordHitCap ?? 12;
  const perHit = config.technicalFit?.keywordWeightPerHit ?? 2;
  const negPenalty = config.technicalFit?.negativeKeywordPenalty ?? 2;

  let hitScore = 0;
  for (const kw of profile.capabilities.keywords ?? []) {
    hitScore += keywordMatchScore(text, kw);
  }
  hitScore = Math.min(hitScore, hitCap);

  let technicalFit = clamp(Math.round(hitScore * perHit), 0, w.technicalFit);

  let negHits = 0;
  for (const kw of profile.capabilities.negativeKeywords ?? []) {
    if (!kw.trim()) continue;
    if (text.includes(kw.toLowerCase())) negHits++;
  }
  if (negHits > 0) {
    technicalFit = clamp(technicalFit - negHits * negPenalty, 0, w.technicalFit);
    notes.push(`Negative keyword hits: ${negHits}.`);
  }

  // --- Strategic value (0..w.strategicValue) ---
  let strategicValue = 0;
  const agency = safeString(notice?.agency ?? notice?.department ?? notice?.office);
  if (!agency) notes.push("Agency missing.");
  else strategicValue += 5;

  const agencyNorm = agency.toUpperCase();
  const dodSignals = ["DEPARTMENT OF DEFENSE", "DOD", "AIR FORCE", "ARMY", "NAVY", "DLA", "DARPA", "DISA", "SOCOM", "USAF", "USN", "USA"];
  if (dodSignals.some((s) => agencyNorm.includes(s))) strategicValue += 5;

  strategicValue = clamp(strategicValue, 0, w.strategicValue);

  // --- Bid friction (0..w.bidFriction) ---
  let bidFriction = w.bidFriction;
  const deadlineDays = daysUntil(
    safeString(notice?.responseDeadLine ?? notice?.responseDeadline ?? notice?.responseDate)
  );

  const minDaysFull = config.bidFriction?.deadline?.minDaysFullScore ?? 21;
  const minDaysZero = config.bidFriction?.deadline?.minDaysZeroScore ?? 2;

  if (deadlineDays === null) {
    bidFriction -= 5;
    notes.push("Response deadline missing/unparseable.");
  } else if (deadlineDays <= minDaysZero) {
    bidFriction = 0;
    notes.push(`Deadline too soon (${deadlineDays}d).`);
  } else if (deadlineDays < minDaysFull) {
    const t = (deadlineDays - minDaysZero) / (minDaysFull - minDaysZero);
    bidFriction = clamp(Math.round(w.bidFriction * t), 0, w.bidFriction);
    notes.push(`Tight deadline (${deadlineDays}d).`);
  }

  // --- Risk (0..w.risk) ---
  let risk = w.risk;
  const unknownPenalty = config.risk?.unknownFieldPenalty ?? 1;
  const maxUnknown = config.risk?.maxUnknownPenalty ?? 8;
  const unknowns: string[] = [];
  const requiredFields = [
    ["noticeId", notice?.noticeId],
    ["title", notice?.title],
    ["description", notice?.description],
    ["responseDeadLine", notice?.responseDeadLine ?? notice?.responseDeadline ?? notice?.responseDate],
    ["naicsCode", notice?.naicsCode ?? notice?.naics],
  ];
  for (const [k, v] of requiredFields) {
    if (!safeString(v).trim()) unknowns.push(k);
  }
  if (unknowns.length) {
    const penalty = Math.min(maxUnknown, unknowns.length * unknownPenalty);
    risk = clamp(risk - penalty, 0, w.risk);
    notes.push(`Missing fields: ${unknowns.join(", ")}.`);
  }

  const total = clamp(
    Math.round(eligibility + technicalFit + strategicValue + bidFriction + risk),
    0,
    w.eligibility + w.technicalFit + w.strategicValue + w.bidFriction + w.risk
  );

  return { total, eligibility, technicalFit, strategicValue, bidFriction, risk, notes };
}

function buildEmailDraft(profile: Profile, opp: ScoredOpportunity): { subject: string; body: string } {
  const subject = `Question re: ${opp.solicitationNumber || opp.noticeId} — ${opp.title || "Solicitation"}`;
  const body = [
    `Hello,`,
    ``,
    `I’m reaching out regarding ${opp.title || "the solicitation"} (${opp.solicitationNumber || opp.noticeId}).`,
    ``,
    `${profile.name} provides ${profile.oneLine}.`,
    ``,
    `Could you confirm the preferred submission method and any required forms/attachments not visible via the public notice metadata?`,
    ``,
    `Thanks,`,
    `${profile.contact.fromName}`,
    `${profile.contact.fromEmail}`,
  ].join("\n");

  return { subject, body };
}

function toCsvRow(cols: string[]): string {
  return cols
    .map((c) => {
      const s = (c ?? "").replaceAll("\r", " ").replaceAll("\n", " ");
      if (s.includes(",") || s.includes('"')) return `"${s.replaceAll('"', '""')}"`;
      return s;
    })
    .join(",");
}

function tryParseJson(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractNextAccessTime(err: unknown): string | null {
  if (!(err instanceof SamGovError)) return null;
  const body = err.bodyText;
  if (!body) return null;
  const parsed = tryParseJson(body);
  const next = parsed?.nextAccessTime;
  return typeof next === "string" && next.trim().length ? next.trim() : null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const outRoot = path.resolve(process.cwd(), args.out ?? "out/samgov");
  const profilePath = path.resolve(process.cwd(), args.profile ?? "bid/scoring/bickford.profile.json");
  const configPath = path.resolve(process.cwd(), args.config ?? "bid/scoring/scoring.config.json");
  const threshold = args.threshold ? Number(args.threshold) : 90;
  // Back-compat: --onlyOpen maps to the new --acceptingBids behavior.
  const acceptingBids = args.acceptingBids
    ? args.acceptingBids !== "0"
    : args.onlyOpen
      ? args.onlyOpen !== "0"
      : true;
  const pages = args.pages ? Number(args.pages) : 1;
  const maxResults = args.maxResults ? Number(args.maxResults) : 1000;
  const rateLimitMs = args.rateLimitMs ? Number(args.rateLimitMs) : 600;

  // Fetching per-notice detail can trigger quotas quickly for large sweeps.
  // Default: enabled for single-page runs; disabled for multi-page sweeps.
  const fetchNotices = args.fetchNotices ? args.fetchNotices !== "0" : pages <= 1;

  const profile = readJson<Profile>(profilePath);
  const config = readJson<ScoringConfig>(configPath);

  let searchJson: any;
  if (args.csv) {
    const csvPath = path.resolve(process.cwd(), args.csv);
    const content = fs.readFileSync(csvPath, "utf8");
    const rows = parseCsv(content);
    if (!rows.length) throw new Error("CSV is empty.");
    const headers = rows[0] ?? [];
    const headerIndex = indexHeaders(headers);

    const items: any[] = [];
    for (const r of rows.slice(1)) {
      if (!r.some((x) => (x ?? "").trim().length > 0)) continue;
      const notice = mapCsvRowToNotice(r, headerIndex);
      if (!notice?.noticeId) continue;
      items.push(notice);
    }

    searchJson = {
      generatedAt: new Date().toISOString(),
      source: "csv",
      csvPath: path.relative(process.cwd(), csvPath),
      items,
    };

    writeJson(path.join(outRoot, "search.json"), searchJson);
  } else if (args.in) {
    searchJson = readJson<any>(path.resolve(process.cwd(), args.in));
  } else {
    const apiKey = requireSamGovApiKey();
    const baseUrl = args.baseUrl;
    const limit = args.limit ? Number(args.limit) : 25;
    const startOffset = args.offset ? Number(args.offset) : 0;
    const appendSearch = args.appendSearch ? args.appendSearch !== "0" : false;

    // SAM.gov expects postedFrom/postedTo in MM/dd/yyyy.
    const postedTo = normalizePostedDateArg(args.postedTo || formatDateMMDDYYYY(new Date()));
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - 30);
    const postedFrom = normalizePostedDateArg(args.postedFrom || formatDateMMDDYYYY(from));

    // Paginate until exhausted or capped.
    const searchPath = path.join(outRoot, "search.json");
    let existing: any | null = null;
    if (appendSearch && fs.existsSync(searchPath)) {
      existing = readJson<any>(searchPath);
    }

    const existingWrappedItems = Array.isArray(existing?.items) ? existing.items : null;
    const existingRawItems = existingWrappedItems ? null : existing ? extractSearchItems(existing) : null;

    const allItems: any[] = existingWrappedItems
      ? [...existingWrappedItems]
      : Array.isArray(existingRawItems)
        ? [...existingRawItems]
        : [];
    let fetchedPages = 0;
    let offset = startOffset;

    if (existing && existingWrappedItems) {
      const sameQuery = safeString(existing?.query) === safeString(args.q);
      const sameFrom = safeString(existing?.postedFrom) === safeString(postedFrom);
      const sameTo = safeString(existing?.postedTo) === safeString(postedTo);
      if (!sameQuery || !sameFrom || !sameTo) {
        throw new Error(
          "--appendSearch is set but out/samgov/search.json does not match the current query/date window. Use a different --out or omit --appendSearch."
        );
      }

      const existingNextOffset = typeof existing?.nextOffset === "number" ? existing.nextOffset : null;
      if (existingNextOffset !== null && Number.isFinite(existingNextOffset) && existingNextOffset >= 0) {
        offset = Math.max(offset, existingNextOffset);
      } else if (typeof existing?.lastOffset === "number" && Number.isFinite(existing.lastOffset)) {
        offset = Math.max(offset, existing.lastOffset + limit);
      }
    } else if (existing && existingRawItems) {
      // Best-effort resume from a raw SAM.gov search response.
      const rawOffset = typeof existing?.offset === "number" ? existing.offset : null;
      const rawLimit = typeof existing?.limit === "number" ? existing.limit : null;
      if (rawOffset !== null && rawLimit !== null) {
        offset = Math.max(offset, rawOffset + rawLimit);
      }
    }

    const checkpoint = (extra?: Record<string, unknown>) => {
      const payload = {
        generatedAt: new Date().toISOString(),
        query: args.q,
        postedFrom,
        postedTo,
        limit,
        startOffset,
        pagesRequested: pages,
        pagesFetched: fetchedPages,
        maxResults,
        lastOffset: offset,
        nextOffset: offset,
        items: allItems.slice(0, maxResults),
        ...extra,
      };
      writeJson(searchPath, payload);
      return payload;
    };

    checkpoint({ appendedFromExisting: Boolean(existing), appendedFromRawSearch: Boolean(existing && existingRawItems) });

    while (fetchedPages < pages && allItems.length < maxResults) {
      try {
        const jsonPage = await samgovGetJson<any>(
          "/opportunities/v2/search",
          { q: args.q, limit, offset, postedFrom, postedTo },
          { apiKey, baseUrl }
        );

        const pageItems = extractSearchItems(jsonPage);
        allItems.push(...pageItems);
        fetchedPages++;

        const fullPage = Array.isArray(pageItems) && pageItems.length === limit;

        const lastOffset = offset;
        offset += limit;
        checkpoint({ lastOffset, nextOffset: offset });

        // Stop if this page is not full — likely end of results.
        if (!fullPage) break;

        if (rateLimitMs > 0) await sleep(rateLimitMs);
      } catch (e: any) {
        const nextAccessTime = extractNextAccessTime(e);
        if (e instanceof SamGovError && e.status === 429) {
          checkpoint({ throttled: true, nextAccessTime: nextAccessTime ?? null });
          const suffix = nextAccessTime ? ` Next access time: ${nextAccessTime}.` : "";
          throw new Error(
            `SAM.gov throttled (HTTP 429). Partial results were checkpointed to ${path.relative(process.cwd(), searchPath)}.${suffix} Rerun later with --appendSearch 1 to continue.`
          );
        }

        checkpoint({ error: e?.message ?? String(e) });
        throw e;
      }
    }

    searchJson = checkpoint({ final: true });
  }

  const items = Array.isArray(searchJson?.items) ? searchJson.items : extractSearchItems(searchJson);

  const apiKeyMaybe = args.in ? null : requireSamGovApiKey();
  const baseUrl = args.baseUrl;

  let noticesThrottled = false;

  const scored: ScoredOpportunity[] = [];
  for (const item of items) {
    const noticeId = pickNoticeId(item);
    if (!noticeId) continue;

    let notice: any = item;
    if (fetchNotices && apiKeyMaybe && !noticesThrottled) {
      try {
        notice = await samgovGetJson<any>(
          "/opportunities/v2/notice",
          { noticeId },
          { apiKey: apiKeyMaybe, baseUrl }
        );
      } catch (e: any) {
        if (e instanceof SamGovError && e.status === 429) noticesThrottled = true;
        // Fall back to search item if notice fetch fails.
        notice = item;
      }
    }

    const title = safeString(notice?.title ?? item?.title);
    const solicitationNumber = safeString(notice?.solicitationNumber ?? item?.solicitationNumber);
    const agency = safeString(notice?.agency ?? notice?.department ?? item?.agency);
    const postedDate = safeString(notice?.postedDate ?? item?.postedDate);
    const responseDeadLine = safeString(notice?.responseDeadLine ?? notice?.responseDeadline ?? item?.responseDeadLine);
    const contactEmail = extractContactEmail(notice);

    if (acceptingBids) {
      // Use the richer notice object when available.
      const accepting = isAcceptingBids({ ...item, ...notice, responseDeadLine });
      if (!accepting) continue;
    }

    const score = scoreOpportunity(profile, config, notice);

    scored.push({ noticeId, title, solicitationNumber, agency, postedDate, responseDeadLine, contactEmail, score, notice });
  }

  scored.sort((a, b) => b.score.total - a.score.total);

  const report = {
    generatedAt: new Date().toISOString(),
    query: args.q ?? null,
    threshold,
    acceptingBids,
    scanned: items.length,
    count: scored.length,
    top: scored.slice(0, 50).map((x) => ({
      noticeId: x.noticeId,
      title: x.title,
      agency: x.agency,
      score: x.score,
      contactEmail: x.contactEmail ?? null,
    })),
  };

  writeJson(path.join(outRoot, "report.json"), report);

  const csvLines: string[] = [];
  csvLines.push(toCsvRow(["noticeId", "score", "title", "agency", "deadline", "contactEmail"]));
  for (const x of scored) {
    csvLines.push(
      toCsvRow([
        x.noticeId,
        String(x.score.total),
        x.title ?? "",
        x.agency ?? "",
        x.responseDeadLine ?? "",
        x.contactEmail ?? "",
      ])
    );
  }
  fs.mkdirSync(outRoot, { recursive: true });
  fs.writeFileSync(path.join(outRoot, "report.csv"), csvLines.join("\n") + "\n", "utf8");

  const sendQueue: any[] = [];

  for (const x of scored) {
    if (x.score.total < threshold) continue;

    const oppDir = path.join(outRoot, "opportunities", x.noticeId);
    fs.mkdirSync(oppDir, { recursive: true });

    writeJson(path.join(oppDir, "score.json"), x.score);
    if (x.notice) writeJson(path.join(oppDir, "notice.json"), x.notice);

    const email = buildEmailDraft(profile, x);
    const to = x.contactEmail ?? "";

    const eml = [
      `From: ${profile.contact.fromName} <${profile.contact.fromEmail}>`,
      to ? `To: ${to}` : "",
      `Subject: ${email.subject}`,
      `Reply-To: ${profile.contact.replyTo || profile.contact.fromEmail}`,
      "",
      email.body,
      "",
    ]
      .filter(Boolean)
      .join("\n");

    fs.writeFileSync(path.join(oppDir, "email.eml"), eml, "utf8");

    const checklist = [
      `# Submission Checklist (Draft)`,
      ``,
      `Notice: ${x.noticeId}`,
      x.solicitationNumber ? `Solicitation: ${x.solicitationNumber}` : "",
      x.title ? `Title: ${x.title}` : "",
      x.agency ? `Agency: ${x.agency}` : "",
      x.responseDeadLine ? `Deadline: ${x.responseDeadLine}` : "Deadline: (unknown)",
      ``,
      `## Minimum package artifacts`,
      `- Capability statement (Bickford)`,
      `- Technical approach (how execution governance + auditability addresses requirements)`,
      `- Security/compliance section (data handling + audit trail + non-interference)`,
      `- Price/cost volume (if required)`,
      `- Past performance references (if required)`,
      ``,
      `## Open questions to contracting officer`,
      `- Confirm submission method (email/portal) and exact required forms`,
      `- Confirm any attachments not available via API metadata`,
      `- Confirm evaluation criteria and weighting (if not stated)`,
      ``,
    ]
      .filter(Boolean)
      .join("\n");

    fs.writeFileSync(path.join(oppDir, "SUBMISSION_CHECKLIST.md"), checklist + "\n", "utf8");

    sendQueue.push({
      noticeId: x.noticeId,
      score: x.score.total,
      to: x.contactEmail ?? null,
      subject: email.subject,
      emlPath: path.relative(process.cwd(), path.join(oppDir, "email.eml")),
    });
  }

  writeJson(path.join(outRoot, "send_queue.json"), {
    generatedAt: new Date().toISOString(),
    threshold,
    count: sendQueue.length,
    items: sendQueue,
    note: "This tool generates EML drafts. Sending email via Gmail requires user credentials/OAuth and is intentionally not automated here.",
  });

  // eslint-disable-next-line no-console
  console.log(`Scored ${scored.length} opportunities.`);
  // eslint-disable-next-line no-console
  console.log(`Wrote ${path.relative(process.cwd(), path.join(outRoot, "report.json"))}`);
  // eslint-disable-next-line no-console
  console.log(`Wrote ${path.relative(process.cwd(), path.join(outRoot, "send_queue.json"))}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e?.message ?? e);
  process.exit(1);
});
