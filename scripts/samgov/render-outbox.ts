import fs from "node:fs";
import path from "node:path";

type SendQueue = {
  generatedAt: string;
  threshold: number;
  count: number;
  items: Array<{
    noticeId: string;
    score: number;
    to: string | null;
    subject: string;
    emlPath: string;
  }>;
  note?: string;
};

type Report = {
  generatedAt: string;
  query: string | null;
  threshold: number;
  count: number;
  top: Array<{
    noticeId: string;
    title?: string;
    agency?: string;
    contactEmail?: string | null;
    score: { total: number; notes?: string[] };
  }>;
};

function usage(): never {
  // eslint-disable-next-line no-console
  console.error(
    "Usage: tsx scripts/samgov/render-outbox.ts [--root out/samgov]"
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
  return out;
}

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) usage();

  const root = path.resolve(process.cwd(), args.root ?? "out/samgov");
  const reportPath = path.join(root, "report.json");
  const sendQueuePath = path.join(root, "send_queue.json");

  if (!fs.existsSync(reportPath)) {
    throw new Error(`Missing ${path.relative(process.cwd(), reportPath)}. Run sam:score first.`);
  }
  if (!fs.existsSync(sendQueuePath)) {
    throw new Error(`Missing ${path.relative(process.cwd(), sendQueuePath)}. Run sam:score first.`);
  }

  const report = readJson<Report>(reportPath);
  const queue = readJson<SendQueue>(sendQueuePath);

  const lines: string[] = [];
  lines.push(`# SAM.gov Outbox`);
  lines.push("");
  lines.push(`Generated: ${queue.generatedAt}`);
  lines.push(`Query: ${report.query ?? "(offline)"}`);
  lines.push(`Threshold: ${queue.threshold}`);
  lines.push(`Queued: ${queue.count}`);
  lines.push("");

  if (queue.count === 0) {
    lines.push(`No opportunities met the threshold.`);
    lines.push("");
    lines.push(`Next actions:`);
    lines.push(`- Lower threshold (e.g., 80) to inspect near-misses`);
    lines.push(`- Tighten your query terms (quoted phrases often help)`);
    lines.push(`- Expand/adjust keywords in bid/scoring/bickford.profile.json`);
    lines.push("");
  } else {
    lines.push(`## Email drafts (send manually)`);
    lines.push("");
    lines.push(`This repo does not auto-send via Gmail. It generates RFC822 `.concat(".eml") .concat(` drafts you can open and send.`));
    lines.push("");

    for (const item of queue.items) {
      lines.push(`- ${item.noticeId} (score ${item.score}) → ${item.to ?? "(no email found)"}`);
      lines.push(`  - Subject: ${item.subject}`);
      lines.push(`  - Draft: ${item.emlPath}`);
    }
    lines.push("");
  }

  lines.push(`## Top scored (for review)`);
  lines.push("");
  const topN = report.top.slice(0, 25);
  for (const x of topN) {
    lines.push(`- ${x.noticeId} — ${x.score.total} — ${x.title ?? "(no title)"}`);
    if (x.contactEmail) lines.push(`  - Contact: ${x.contactEmail}`);
    if (x.agency) lines.push(`  - Agency: ${x.agency}`);
    if (x.score?.notes?.length) lines.push(`  - Notes: ${x.score.notes.slice(0, 4).join(" | ")}`);
  }

  lines.push("");
  lines.push(queue.note ? `Note: ${queue.note}` : "");

  const outPath = path.join(root, "OUTBOX.md");
  fs.writeFileSync(outPath, lines.filter(Boolean).join("\n") + "\n", "utf8");

  // eslint-disable-next-line no-console
  console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
}

main();
