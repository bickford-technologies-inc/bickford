import { runCheckDeps } from "./check-deps.js";
import { runCheckLockfile } from "./check-lockfile.js";
import { runCheckNoDeepImports } from "./check-no-deep-imports.js";
import { runCheckExportParity } from "./check-export-parity.js";

export { runCheckDeps } from "./check-deps.js";
export { runCheckLockfile } from "./check-lockfile.js";
export { runCheckNoDeepImports } from "./check-no-deep-imports.js";
export { runCheckExportParity } from "./check-export-parity.js";

// Optionally, run all checks if called directly
export async function runAllChecks() {
  await runCheckDeps();
  await runCheckLockfile();
  await runCheckNoDeepImports();
  await runCheckExportParity();
}
