import { SuperconductorLedger } from "./superconductor-ledger";

const ledger = new SuperconductorLedger();

ledger.append({
  timestamp: Date.now(),
  action: "user.login",
  constraints: ["must_be_authenticated"],
  outcome: "allowed",
  reason: "User provided valid credentials",
});

ledger.append({
  timestamp: Date.now(),
  action: "user.delete",
  constraints: ["must_be_admin", "must_be_confirmed"],
  outcome: "blocked",
  reason: "User is not admin",
});

console.log("Ledger Merkle Root:", ledger.getMerkleRoot().toString("hex"));
console.log(
  "Ledger Integrity:",
  ledger.verifyIntegrity() ? "VALID" : "INVALID",
);
