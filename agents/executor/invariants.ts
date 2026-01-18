export function assertExecutable(step: string) {
  if (!step) throw new Error("Execution step is empty");
}
