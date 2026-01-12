import fs from "node:fs";
import path from "node:path";

type Opportunity = {
  id: string;
  title: string;
  agency: string;
  why: string[];
  scoreBand?: string;
  revenueLikelihood?: string;
};

type Profile = {
  name: string;
  oneLine: string;
  contact: { fromName: string; fromEmail: string; replyTo?: string };
};

type TemplateVars = {
  customer: string;
  solicitationId: string;
  programName: string;
  pointOfContact: string;
  generatedAt: string;
};

function usage(): never {
  // eslint-disable-next-line no-console
  console.error(
    [
      "Usage: tsx scripts/bid/generate-b1-packages.ts",
      "  [--list bid/b1.opportunities.json]",
      "  [--out out/bid_packages_b1]",
      "  [--profile bid/scoring/bickford.profile.json]",
    ].join("\n")
  );
  process.exit(2);
}

function parseArgs(argv: string[]): { list: string; out: string; profile: string } {
  let list = "bid/b1.opportunities.json";
  let out = "out/bid_packages_b1";
  let profile = "bid/scoring/bickford.profile.json";

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--list") list = argv[++i] ?? "";
    else if (a === "--out") out = argv[++i] ?? "";
    else if (a === "--profile") profile = argv[++i] ?? "";
    else if (a === "--help" || a === "-h") usage();
  }

  if (!list || !out || !profile) usage();
  return { list, out, profile };
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

function renderTemplate(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, v);
  }
  return out;
}

function sanitizeSlug(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildEmail(profile: Profile, opp: Opportunity): { subject: string; eml: string } {
  const subject = `Question re: ${opp.title} (${opp.id})`;
  const body = [
    "Hello,",
    "",
    `I’m reaching out regarding ${opp.title} (${opp.id}) with ${opp.agency}.`,
    "",
    `${profile.name} provides ${profile.oneLine}.`,
    "",
    "Could you point me to the active solicitation/vehicle for this work and confirm the preferred submission method, key dates, and required attachments?",
    "",
    "Thanks,",
    profile.contact.fromName,
    profile.contact.fromEmail,
  ].join("\n");

  const eml = [
    `From: ${profile.contact.fromName} <${profile.contact.fromEmail}>`,
    "To: ",
    `Subject: ${subject}`,
    `Reply-To: ${profile.contact.replyTo || profile.contact.fromEmail}`,
    "",
    body,
    "",
  ].join("\n");

  return { subject, eml };
}

function buildOpportunityBrief(opp: Opportunity): string {
  const why = (opp.why ?? []).map((w) => `- ${w}`).join("\n");

  const assumptions = [
    "- Confirm the actual SAM.gov notice / contract vehicle and noticeId",
    "- Confirm period of performance, place of performance, and security requirements",
    "- Confirm NAICS/PSC and set-aside status",
    "- Confirm response deadline and submission portal/email",
    "- Extract evaluation criteria + weighting",
  ].join("\n");

  return [
    `# Opportunity Brief — ${opp.title}`,
    "",
    `ID: ${opp.id}`,
    `Agency: ${opp.agency}`,
    opp.scoreBand ? `Score band: ${opp.scoreBand}` : "",
    opp.revenueLikelihood ? `Revenue likelihood: ${opp.revenueLikelihood}` : "",
    "",
    "## Why this is prioritized",
    why || "- (not provided)",
    "",
    "## What this package contains",
    "- BIDPACK_README.md (how to use these artifacts)",
    "- COMPLIANCE_MATRIX.md (fill program-specific answers)",
    "- SUBMISSION_CHECKLIST.md (pre/submit/post)",
    "- email.eml (draft outreach email)",
    "",
    "## Missing inputs to complete the final submission",
    assumptions,
    "",
  ]
    .filter(Boolean)
    .join("\n")
    .trim() + "\n";
}

function main() {
  const repoRoot = path.resolve(__dirname, "../..");
  const args = parseArgs(process.argv.slice(2));

  const listPath = path.resolve(repoRoot, args.list);
  const outRoot = path.resolve(repoRoot, args.out);
  const profilePath = path.resolve(repoRoot, args.profile);

  const opps = readJson<Opportunity[]>(listPath);
  const profile = readJson<Profile>(profilePath);

  const templatesDir = path.join(repoRoot, "bid/templates");
  const readTemplate = (name: string) => fs.readFileSync(path.join(templatesDir, name), "utf8");
  const complianceT = readTemplate("COMPLIANCE_MATRIX.template.md");
  const checklistT = readTemplate("SUBMISSION_CHECKLIST.template.md");
  const readmeT = readTemplate("README_BIDPACK.template.md");

  fs.rmSync(outRoot, { recursive: true, force: true });
  ensureDir(outRoot);

  const generatedAt = new Date().toISOString();

  const indexLines: string[] = [];
  indexLines.push("# B1 Bid Packages");
  indexLines.push("");
  indexLines.push(`Generated: ${generatedAt}`);
  indexLines.push("");

  for (const opp of opps) {
    const slug = `${opp.id}-${sanitizeSlug(opp.title)}`;
    const pkgDir = path.join(outRoot, slug);
    ensureDir(pkgDir);

    const vars: TemplateVars = {
      customer: opp.agency,
      solicitationId: opp.id,
      programName: opp.title,
      pointOfContact: "(TBD — fill from notice)",
      generatedAt,
    };

    writeText(path.join(pkgDir, "BIDPACK_README.md"), renderTemplate(readmeT, vars));
    writeText(path.join(pkgDir, "COMPLIANCE_MATRIX.md"), renderTemplate(complianceT, vars));
    writeText(path.join(pkgDir, "SUBMISSION_CHECKLIST.md"), renderTemplate(checklistT, vars));
    writeText(path.join(pkgDir, "OPPORTUNITY_BRIEF.md"), buildOpportunityBrief(opp));

    const email = buildEmail(profile, opp);
    writeText(path.join(pkgDir, "email.eml"), email.eml);

    indexLines.push(`- ${opp.id} — ${opp.title} (${opp.agency}) → ./${slug}/`);
  }

  writeText(path.join(outRoot, "INDEX.md"), indexLines.join("\n") + "\n");

  // eslint-disable-next-line no-console
  console.log(`Wrote ${path.relative(repoRoot, outRoot)}/ (${opps.length} packages)`);
}

main();
