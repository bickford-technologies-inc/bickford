// CANON — ROLLING CONTRACT PLACEHOLDER
// Implementation lives in integration layer

export interface VercelRollingManager {
  enableRolling(projectId: string): Promise<void>;
  disableRolling(projectId: string): Promise<void>;
}
