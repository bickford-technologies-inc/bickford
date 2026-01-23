#!/usr/bin/env node
import fs from "fs";
import path from "path";

const DEFAULT_BASELINE = path.resolve("benchmarks/best-in-class.json");
const DEFAULT_CURRENT = path.resolve("benchmarks/bickford-capabilities.json");
const DEFAULT_OUTPUT_DIR = path.resolve("artifacts");

const args = process.argv.slice(2);
const baselinePath = resolveFlag(args, "--baseline") ?? DEFAULT_BASELINE;
const currentPath = resolveFlag(args, "--current") ?? DEFAULT_CURRENT;
const outputDir = resolveFlag(args, "--out") ?? DEFAULT_OUTPUT_DIR;

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const current = JSON.parse(fs.readFileSync(currentPath, "utf8"));

const baselineMap = new Map(
  baseline.capabilities.map((entry) => [entry.id, entry]),
);
const currentMap = new Map(
  current.capabilities.map((entry) => [entry.id, entry]),
);

const gaps = [];
const matches = [];

for (const [id, target] of baselineMap.entries()) {
  const snapshot = currentMap.get(id);
  if (!snapshot) {
    gaps.push({
      id,
      metric: target.metric,
      target: target.target,
      current: null,
      status: "missing",
      owner: null,
    });
    continue;
  }

  const comparison = evaluateGap(target, snapshot);
  if (comparison.gap) {
    gaps.push({
      id,
      metric: target.metric,
      target: target.target,
      current: snapshot.current,
      status: comparison.status,
      owner: snapshot.owner ?? null,
    });
  } else {
    matches.push({
      id,
      metric: target.metric,
      target: target.target,
      current: snapshot.current,
      status: "met",
      owner: snapshot.owner ?? null,
    });
  }
}

const report = {
  generated_at: new Date().toISOString(),
  baseline: path.relative(process.cwd(), baselinePath),
  current: path.relative(process.cwd(), currentPath),
  totals: {
    capabilities: baseline.capabilities.length,
    gaps: gaps.length,
    met: matches.length,
  },
  gaps,
  met: matches,
};

fs.mkdirSync(outputDir, { recursive: true });
const jsonPath = path.join(outputDir, "benchmark-gaps.json");
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

const mdPath = path.join(outputDir, "benchmark-gaps.md");
fs.writeFileSync(mdPath, renderMarkdown(report));

console.log(`Benchmark gap report written to ${jsonPath}`);

function resolveFlag(argsList, name) {
  const index = argsList.findIndex((value) => value === name);
  if (index !== -1) return argsList[index + 1];
  const prefix = `${name}=`;
  const inline = argsList.find((value) => value.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  return null;
}

function evaluateGap(target, snapshot) {
  if (typeof target.target === "boolean") {
    return {
      gap: snapshot.current !== target.target,
      status: snapshot.current === target.target ? "met" : "mismatch",
    };
  }
  if (typeof target.target === "number") {
    return {
      gap: snapshot.current < target.target,
      status: snapshot.current < target.target ? "below-target" : "met",
    };
  }
  return {
    gap: snapshot.current !== target.target,
    status: snapshot.current === target.target ? "met" : "mismatch",
  };
}

function renderMarkdown(report) {
  const lines = [
    "# Benchmark Gap Report",
    "",
    `Generated: ${report.generated_at}`,
    "",
    `Baseline: ${report.baseline}`,
    `Current: ${report.current}`,
    "",
    "## Summary",
    "",
    `- Total capabilities: ${report.totals.capabilities}`,
    `- Gaps: ${report.totals.gaps}`,
    `- Met: ${report.totals.met}`,
    "",
    "## Gaps",
    "",
    "| Capability | Target | Current | Status | Owner |",
    "| --- | --- | --- | --- | --- |",
  ];

  if (report.gaps.length === 0) {
    lines.push("| None | - | - | - | - |");
  } else {
    for (const gap of report.gaps) {
      lines.push(
        `| ${gap.metric} | ${gap.target} | ${gap.current ?? "missing"} | ${gap.status} | ${gap.owner ?? "unassigned"} |`,
      );
    }
  }

  lines.push("", "## Met", "", "| Capability | Target | Current | Status | Owner |", "| --- | --- | --- | --- | --- |");

  if (report.met.length === 0) {
    lines.push("| None | - | - | - | - |");
  } else {
    for (const met of report.met) {
      lines.push(
        `| ${met.metric} | ${met.target} | ${met.current ?? "missing"} | ${met.status} | ${met.owner ?? "unassigned"} |`,
      );
    }
  }

  return lines.join("\n");
}
