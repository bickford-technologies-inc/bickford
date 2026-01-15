import crypto from "crypto";
import { DecisionRecord } from "./types";

export function hashDecision(record: Omit<DecisionRecord, "hash">) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(record))
    .digest("hex");
}
