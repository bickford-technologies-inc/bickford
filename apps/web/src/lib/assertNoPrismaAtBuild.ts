export function assertNoPrismaAtBuild() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    throw new Error(
      "Invariant violation: Prisma access attempted during Next.js build phase"
    );
  }
}
