import { invariantStable } from "../envelope/invariants";

describe("MAX-SAFE invariants", () => {
  it("allows MAX only when all invariants hold", () => {
    expect(
      invariantStable({
        greenBuildsInRow: 2,
        syntaxErrors: 0,
        partialWriteDetected: false,
        canonViolations: 0,
      })
    ).toBe(true);
  });

  it("forces REDUCED on any violation", () => {
    expect(
      invariantStable({
        greenBuildsInRow: 1,
        syntaxErrors: 1,
        partialWriteDetected: true,
        canonViolations: 1,
      })
    ).toBe(false);
  });
});
