import fs from "fs";
import path from "path";
import { DecisionRecord } from "./types";

export function writeAudit(record: DecisionRecord) {
  const file = path.join(
    "audit/ledger",
    `${record.timestamp.replace(/[:.]/g, "-")}.json`
  );

  fs.writeFileSync(file, JSON.stringify(record, null, 2));
}
