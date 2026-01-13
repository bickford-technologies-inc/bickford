import { existsSync } from "fs";
if (!existsSync("node_modules/.prisma/client")) {
  throw new Error(
    "Invariant violation: Prisma client not generated. Enforcement denied."
  );
}
