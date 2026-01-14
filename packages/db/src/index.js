// Canonical DB entrypoint
// Only export one `prisma` (from client for CJS compatibility)
export { prisma } from "./client";
export { getPrisma } from "./runtime";
