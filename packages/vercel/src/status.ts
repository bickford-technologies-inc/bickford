// CANON — STATUS CONTRACT PLACEHOLDER
// Implementation lives in integration layer

export interface VercelStatusManager {
  getStatus(projectId: string): Promise<string>;
}
