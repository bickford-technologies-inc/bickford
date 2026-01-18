import { ValidationResult } from "./types";
import { assertValidated } from "./invariants";

export function validate(output: unknown): ValidationResult {
  const valid = output !== null && output !== undefined;
  assertValidated(valid);
  return { valid };
}
