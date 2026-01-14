import { GuardViolation } from "./types";

export const RUNTIME_IMPORT_GUARD: GuardViolation = {
  id: "runtime-import-at-build",
  description: "Runtime resource imported at build time",
  fixable: true,
  autoFix(file) {
    return file.replace(
      /^import .*@prisma\/client.*$/m,
      "// ❌ moved to runtime scope\n"
    );
  },
};
