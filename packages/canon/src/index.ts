// Canonical public API surface for @bickford/bickford
export { promoteCanon } from "./canon/promote";
export { enforceInvariants } from "./canon/invariants";
export { runtime } from "./runtime";
export { optr } from "./optr";
export { nonInterference } from "./nonInterference";

export type { ExecutionResult } from "./canon/types";
