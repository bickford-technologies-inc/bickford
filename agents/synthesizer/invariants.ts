export function assertSynthesis(summary: string) {
  if (!summary.length) throw new Error("Empty synthesis");
}
