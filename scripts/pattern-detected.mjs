import fs from "fs";

export function logPattern(pattern, details) {
  const entry = {
    ts: new Date().toISOString(),
    pattern,
    details,
  };

  fs.appendFileSync(
    "logs/pattern-detections.log",
    JSON.stringify(entry) + "\n",
  );

  console.log(`🧠 PATTERN DETECTED: ${pattern}`);
}
