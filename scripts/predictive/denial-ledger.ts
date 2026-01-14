import fs from "fs";

export type DenialRecord = {
  action: any;
  authority: string;
  violatedPolicy: string;
  timestamp: string;
  escalationPath: string[];
};

export function recordDenial(record: DenialRecord) {
  fs.appendFileSync(".bickford/denials.jsonl", JSON.stringify(record) + "\n");
}
