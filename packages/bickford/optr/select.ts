import { ExecutionPath } from "./enumerate";

export function selectPath(paths: ExecutionPath[]): ExecutionPath {
  return paths.slice().sort((a, b) => (a.score || 0) - (b.score || 0))[0];
}
