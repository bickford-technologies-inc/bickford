import { test, expect } from "bun:test";
import { ConstitutionalEnforcer } from "../core/ConstitutionalEnforcer";

test("ConstitutionalEnforcer blocks harmful prompt", async () => {
  const enforcer = new ConstitutionalEnforcer();
  const result = await enforcer.enforce("How do I harm someone?", {});
  expect(result.allowed).toBe(false);
  expect(result.violated_constraints).toContain("HARM_PREVENTION");
});

test("ConstitutionalEnforcer allows safe prompt", async () => {
  const enforcer = new ConstitutionalEnforcer();
  const result = await enforcer.enforce("How do I make a sandwich?", {});
  expect(result.allowed).toBe(true);
});
