// Minimal stub for test ledger creation
const fs = require("fs");
const entries = Array.from({ length: 1000 }, (_, i) => ({
  id: `entry-${i}`,
  timestamp: new Date(Date.now() + i * 1000).toISOString(),
  eventType: "api_call",
  payload: { model: "claude-sonnet-4-5", tokens: 1000 },
  previousHash: "0".repeat(64),
  currentHash: "a1b2c3d4e5f6...",
}));
fs.writeFileSync("./test-ledger.json", JSON.stringify(entries, null, 2));
console.log("Test ledger created: ./test-ledger.json");
