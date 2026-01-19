// CANON — DEPLOY CONTRACT PLACEHOLDER
// Implementation lives in integration layer

export interface VercelDeploy {
  deploy(projectId: string): Promise<void>;
}
