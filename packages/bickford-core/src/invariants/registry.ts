import { InvariantTest } from "./types";

export const INVARIANTS: InvariantTest[] = [
  {
    id: "NO_DUPLICATE_WORKSPACE_NAMES",
    description: "Workspace package names must be globally unique",
    assert(state) {
      return state.workspace.hasDuplicates
        ? { ok: false, reason: "Duplicate workspace names detected" }
        : { ok: true };
    }
  },
  {
    id: "EXECUTABLE_DEPENDS_ON_CORE",
    description: "apps/* must depend on @bickford/core",
    assert(state) {
      return state.executablesMissingCore.length > 0
        ? {
            ok: false,
            reason:
              "Executables missing @bickford/core: " +
              state.executablesMissingCore.join(", ")
          }
        : { ok: true };
    }
  },
  {
    id: "NODE_EXECUTED_FILES_ARE_MJS",
    description: "Node-executed files must be .mjs",
    assert(state) {
      return state.nodeExecTsFiles.length > 0
        ? {
            ok: false,
            reason:
              "Node executing TS files: " +
              state.nodeExecTsFiles.join(", ")
          }
        : { ok: true };
    }
  }
];
