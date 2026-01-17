export interface StabilitySignal {
  greenBuildsInRow: number;
  syntaxErrors: number;
  partialWriteDetected: boolean;
  canonViolations: number;
}

export function invariantStable(s: StabilitySignal): boolean {
  return (
    s.greenBuildsInRow >= 2 &&
    s.syntaxErrors === 0 &&
    s.partialWriteDetected === false &&
    s.canonViolations === 0
  );
}
