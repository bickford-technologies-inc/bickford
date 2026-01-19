#!/usr/bin/env node
import fs from "fs";

const history = JSON.parse(
  fs.readFileSync("canon/invariant-history.json", "utf8"),
);

const buckets = {};

for (const h of history) {
  const day = h.timestamp.slice(0, 10);
  buckets[day] ??= 0;
  buckets[day]++;
}

const chart = Object.entries(buckets)
  .map(([day, count]) => `${day},${count}`)
  .join("\n");

fs.writeFileSync(
  "canon/invariant-pressure.csv",
  "date,violations\n" + chart + "\n",
);

console.log("📈 Invariant pressure dataset generated");
