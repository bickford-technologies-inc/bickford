import fs from "fs";
import path from "path";

const DA_ROOT = path.join(process.cwd(), "datalake");
const WF_ROOT = path.join(DA_ROOT, "workflows");

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

function ensureWorkflow(keyword: string) {
  const wfDir = path.join(WF_ROOT, keyword);
  const wfPath = path.join(wfDir, "workflow.json");
  const statePath = path.join(wfDir, "state.json");
  if (!fs.existsSync(wfDir)) fs.mkdirSync(wfDir, { recursive: true });
  if (!fs.existsSync(wfPath))
    fs.writeFileSync(
      wfPath,
      JSON.stringify({ intent: {}, actions: [] }, null, 2)
    );
  if (!fs.existsSync(statePath))
    fs.writeFileSync(statePath, JSON.stringify({}, null, 2));
  return { wfPath, statePath };
}

function logMessage(message: object) {
  const msgPath = path.join(DA_ROOT, "messages.jsonl");
  fs.appendFileSync(msgPath, JSON.stringify(message) + "\n");
}

function logLedger(entry: object) {
  const ledgerPath = path.join(DA_ROOT, "ledger.jsonl");
  fs.appendFileSync(ledgerPath, JSON.stringify(entry) + "\n");
}

export function routeMessage(rawText: string, agentId: string) {
  const keywords = extractKeywords(rawText);
  const msg = {
    id: String(Date.now()) + "-" + Math.random().toString(16).slice(2),
    agent: agentId,
    timestamp: Date.now(),
    text: rawText,
    keywords,
  };
  logMessage(msg);
  keywords.forEach((keyword) => {
    const { wfPath, statePath } = ensureWorkflow(keyword);
    // Load workflow, optionally modify or realize intent (stub below)
    // You can expand this block for actual execution logic as needed.
    const wf = JSON.parse(fs.readFileSync(wfPath, "utf8"));
    void wf;
    // (Modify wf/actions if directed by message context)
    // If execution occurs, append result to ledger
    logLedger({
      decision: `routed:${keyword}`,
      agent: agentId,
      timestamp: Date.now(),
      msg,
      stateRef: statePath,
      wfRef: wfPath,
    });
  });
}
