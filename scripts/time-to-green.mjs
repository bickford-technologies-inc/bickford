import fs from "fs";
import { execSync } from "child_process";

const commit = execSync("git rev-parse HEAD").toString().trim();
const ts = Date.now();

const record = {
  commit,
  timestamp: ts,
  status: "BUILD_TRIGGERED",
  failureClass: "CANONICAL_TYPE_DRIFT",
};

fs.appendFileSync("metrics/time-to-green.jsonl", JSON.stringify(record) + "\n");
