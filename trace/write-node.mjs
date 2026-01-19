import fs from "fs";

const traceDir = "trace";
fs.mkdirSync(traceDir, { recursive: true });

const node = {
  id: process.env.TRACE_ID,
  agent: process.env.AGENT_NAME,
  action: process.env.TRACE_ACTION,
  ts: Date.now(),
};

fs.writeFileSync(`${traceDir}/${node.id}.json`, JSON.stringify(node, null, 2));

console.log("🧬 trace node written:", node.id);
