import { runCheckDeps } from "./check-deps";
import { runCheckLockfile } from "./check-lockfile";
import { runCheckNoDeepImports } from "./check-no-deep-imports";
import { runCheckExportParity } from "./check-export-parity";

export { runCheckDeps } from "./check-deps";
export { runCheckLockfile } from "./check-lockfile";
export { runCheckNoDeepImports } from "./check-no-deep-imports";
export { runCheckExportParity } from "./check-export-parity";

// Optionally, run all checks if called directly
export async function runAllChecks() {
  await runCheckDeps();
  await runCheckLockfile();
  await runCheckNoDeepImports();
  await runCheckExportParity();
}
