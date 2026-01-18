import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "packages/web-ui/.bickford-ledger");
const THREADS = path.join(ROOT, "threads");
const INDEX = path.join(ROOT, "index.json");

export function writeThread(threadId: string, data: any) {
  fs.writeFileSync(
    path.join(THREADS, `${threadId}.json`),
    JSON.stringify(data, null, 2)
  );

  const index = readIndex();
  index[threadId] = {
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(INDEX, JSON.stringify(index, null, 2));
}

export function readThread(threadId: string) {
  const p = path.join(THREADS, `${threadId}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function listThreads() {
  return readIndex();
}

function readIndex() {
  if (!fs.existsSync(INDEX)) return {};
  return JSON.parse(fs.readFileSync(INDEX, "utf8"));
}
