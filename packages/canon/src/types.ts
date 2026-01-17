export interface ExecutionResult {
  status: "promoted" | "rejected";
  input: unknown;
}
