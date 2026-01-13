import type { Decision } from "@bickford/types";

describe("Ledger ↔ Canon Contract", () => {
  it("Decision matches canonical shape", () => {
    const d: Decision = {
      id: "d1",
      intent: "test",
      timestamp: Date.now(),
      denied: false,
    };

    expect(d).toBeDefined();
  });
});
