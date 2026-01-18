export function assertValidated(valid: boolean) {
  if (valid === undefined) {
    throw new Error("Validation must return a boolean");
  }
}
