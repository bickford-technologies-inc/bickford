// CANON — DEPLOY CONTRACT PLACEHOLDER
// Implementation lives in integration layer

export interface VercelDeploy {
  deploy(projectId: string): Promise<void>;
}

export type DeployFromGitRequest = {
  project: string;
  repo: string;
  org: string;
};

export type DeployFromGitResult = {
  id: string;
  status: "started" | "queued";
};

export async function deployFromGit(
  request: DeployFromGitRequest,
): Promise<DeployFromGitResult> {
  return {
    id: `${request.project}-${Date.now()}`,
    status: "started",
  };
}
