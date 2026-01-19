import { Constitution } from "./fork";

export function mergeIfSafe(base: Constitution, fork: Constitution) {
  const conflicts = fork.invariants.filter(
    (i) => base.invariants.includes(i) === false,
  );

  if (conflicts.length > 0) {
    return { merged: false, conflicts };
  }

  return {
    merged: true,
    constitution: {
      version: base.version,
      invariants: base.invariants,
    },
  };
}
