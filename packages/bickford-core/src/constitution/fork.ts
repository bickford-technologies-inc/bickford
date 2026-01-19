export type Constitution = {
  version: string;
  invariants: string[];
};

export function forkConstitution(
  base: Constitution,
  deltaInvariants: string[],
): Constitution {
  return {
    version: `${base.version}-fork`,
    invariants: [...base.invariants, ...deltaInvariants],
  };
}
