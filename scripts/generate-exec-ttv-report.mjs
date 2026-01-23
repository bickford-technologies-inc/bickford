import fs from "fs";
import path from "path";

const ledgerPath =
  process.env.EXECUTION_LEDGER_PATH || "execution-ledger.jsonl";
const outputDir = process.env.TTV_REPORT_DIR || "artifacts";
const valuePerHour = Number(process.env.TTV_VALUE_PER_HOUR || "0");

function parseLedgerLine(line) {
  try {
    return JSON.parse(line);
  } catch (error) {
    return null;
  }
}

function extractSnapshot(entry) {
  if (
    entry?.ttvSnapshot?.baselineSeconds &&
    entry?.ttvSnapshot?.realizedSeconds
  ) {
    return entry.ttvSnapshot;
  }

  if (entry?.metrics?.baselineSeconds && entry?.metrics?.realizedSeconds) {
    return entry.metrics;
  }

  if (
    typeof entry?.baselineSeconds === "number" &&
    typeof entry?.realizedSeconds === "number"
  ) {
    return {
      baselineSeconds: entry.baselineSeconds,
      realizedSeconds: entry.realizedSeconds,
    };
  }

  return null;
}

if (!fs.existsSync(ledgerPath)) {
  console.log(
    `No execution ledger found at ${ledgerPath}; skipping TTV report.`,
  );
  process.exit(0);
}

const lines = fs.readFileSync(ledgerPath, "utf8").split("\n").filter(Boolean);
const reports = [];

for (const line of lines) {
  const entry = parseLedgerLine(line);
  if (!entry) continue;

  const snapshot = extractSnapshot(entry);
  if (!snapshot) continue;

  const ttvSecondsRecovered =
    snapshot.baselineSeconds - snapshot.realizedSeconds;
  const estimatedDollarValue = (ttvSecondsRecovered / 3600) * valuePerHour;
  const executionHash =
    entry.hash || entry.executionHash || entry.id || "unknown";

  reports.push({
    executionHash,
    ttvSecondsRecovered,
    estimatedDollarValue,
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  sourceLedger: ledgerPath,
  valuePerHour,
  totalExecutions: reports.length,
  totalTtvSecondsRecovered: reports.reduce(
    (sum, r) => sum + r.ttvSecondsRecovered,
    0,
  ),
  totalEstimatedDollarValue: reports.reduce(
    (sum, r) => sum + r.estimatedDollarValue,
    0,
  ),
};

fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "ttv-report.json");
fs.writeFileSync(outputPath, JSON.stringify({ summary, reports }, null, 2));

console.log(`TTV report written to ${outputPath}`);
