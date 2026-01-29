import { test, expect } from "bun:test";
import { ExecutionAuthority } from "../core/ExecutionAuthority";
import { ConstitutionalEnforcer } from "../core/ConstitutionalEnforcer";
import { Ledger } from "../ledger/ledger";

test("ExecutionAuthority pattern learning and enforcement", async () => {
  const enforcer = new ConstitutionalEnforcer();
  const ledger = new Ledger();
  const authority = new ExecutionAuthority(enforcer, ledger);
  const intent = {
    id: "1",
    prompt: "How do I make a sandwich?",
    context: {},
    timestamp: Date.now(),
  };
  const decision1 = await authority.execute(intent);
  expect(decision1.allowed).toBe(true);
  expect(decision1.confidence).toBe(0.75);
  // Second time: should use pattern
  const decision2 = await authority.execute(intent);
  expect(decision2.allowed).toBe(true);
  expect(decision2.patternHash).toBe(decision1.patternHash);
});
