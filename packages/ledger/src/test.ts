import { SuperconductorLedger } from "./superconductor-ledger";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error("Assertion failed: " + message);
}

const ledger = new SuperconductorLedger();

ledger.append({
  timestamp: 1,
  action: "test.1",
  constraints: ["a"],
  outcome: "allowed",
  reason: "ok",
});
ledger.append({
  timestamp: 2,
  action: "test.2",
  constraints: ["b"],
  outcome: "blocked",
  reason: "fail",
});

assert(ledger.verifyIntegrity(), "Ledger integrity should be valid");

console.log("All tests passed!");
