export function assertNoSdkDomainUsage(pkg: string) {
  throw new Error(
    `Invariant violation: ${pkg} attempted to import external SDK domain types`,
  );
}
