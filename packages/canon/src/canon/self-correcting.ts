/**
 * Self-Correcting States and Audit System
 * TIMESTAMP: 2026-01-19T23:13:00Z
 *
 * Rapid self-correction mechanisms and comprehensive audit trails
 * to limit bottlenecks in configurations or integrations.
 */

export interface StateSnapshot<T = unknown> {
  id: string;
  ts: string;
  state: T;
  checksum: string;
  version: number;
}

export interface StateCorrection<T = unknown> {
  id: string;
  ts: string;
  from: StateSnapshot<T>;
  to: StateSnapshot<T>;
  reason: string;
  automatic: boolean;
}

export interface AuditEntry {
  id: string;
  ts: string;
  category: "STATE" | "CONFIG" | "EXECUTION" | "ERROR" | "SECURITY";
  severity: "INFO" | "WARN" | "ERROR" | "CRITICAL";
  action: string;
  actor: string;
  details: Record<string, unknown>;
  tags?: string[];
}

export interface Bottleneck {
  id: string;
  ts: string;
  type: "CONFIG" | "INTEGRATION" | "RESOURCE" | "DEPENDENCY";
  location: string;
  impact: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  suggestedFix?: string;
}

/**
 * Self-correcting state manager with automatic recovery
 */
export class SelfCorrectingState<T> {
  private snapshots: StateSnapshot<T>[] = [];
  private corrections: StateCorrection<T>[] = [];
  private readonly MAX_SNAPSHOTS = 100;

  constructor(
    private validator: (state: T) => boolean,
    private corrector: (invalid: T) => T
  ) {}

  /**
   * Take state snapshot with checksum
   */
  snapshot(state: T): StateSnapshot<T> {
    const snapshot: StateSnapshot<T> = {
      id: `snap_${Date.now()}`,
      ts: new Date().toISOString(),
      state,
      checksum: this.computeChecksum(state),
      version: this.snapshots.length + 1,
    };

    this.snapshots.push(snapshot);

    // Prune old snapshots
    if (this.snapshots.length > this.MAX_SNAPSHOTS) {
      this.snapshots = this.snapshots.slice(-this.MAX_SNAPSHOTS);
    }

    return snapshot;
  }

  /**
   * Validate and auto-correct state if needed
   */
  validateAndCorrect(state: T, reason: string = "validation-failure"): {
    valid: boolean;
    corrected: boolean;
    state: T;
    correction?: StateCorrection<T>;
  } {
    const isValid = this.validator(state);

    if (isValid) {
      return {
        valid: true,
        corrected: false,
        state,
      };
    }

    // Auto-correct
    const correctedState = this.corrector(state);
    const isValidNow = this.validator(correctedState);

    if (!isValidNow) {
      // Correction failed
      return {
        valid: false,
        corrected: false,
        state,
      };
    }

    // Record correction
    const correction: StateCorrection<T> = {
      id: `corr_${Date.now()}`,
      ts: new Date().toISOString(),
      from: this.snapshot(state),
      to: this.snapshot(correctedState),
      reason,
      automatic: true,
    };

    this.corrections.push(correction);

    // Prune old corrections
    if (this.corrections.length > this.MAX_SNAPSHOTS) {
      this.corrections = this.corrections.slice(-this.MAX_SNAPSHOTS);
    }

    return {
      valid: true,
      corrected: true,
      state: correctedState,
      correction,
    };
  }

  /**
   * Get correction history
   */
  getCorrectionHistory(): StateCorrection<T>[] {
    return [...this.corrections];
  }

  /**
   * Get snapshot history
   */
  getSnapshotHistory(): StateSnapshot<T>[] {
    return [...this.snapshots];
  }

  /**
   * Rollback to previous snapshot
   */
  rollback(steps: number = 1): T | null {
    if (this.snapshots.length < steps + 1) return null;
    return this.snapshots[this.snapshots.length - steps - 1].state;
  }

  /**
   * Compute state checksum
   */
  private computeChecksum(state: T): string {
    const str = JSON.stringify(state);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * Comprehensive audit logger with bottleneck detection
 */
export class AuditLogger {
  private entries: AuditEntry[] = [];
  private bottlenecks: Bottleneck[] = [];
  private readonly MAX_ENTRIES = 10000;
  private readonly MAX_BOTTLENECKS = 100;

  /**
   * Log audit entry
   */
  log(entry: Omit<AuditEntry, "id" | "ts">): AuditEntry {
    const fullEntry: AuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ts: new Date().toISOString(),
      ...entry,
    };

    this.entries.push(fullEntry);

    // Auto-detect bottlenecks from error patterns
    if (entry.severity === "ERROR" || entry.severity === "CRITICAL") {
      this.detectBottleneck(fullEntry);
    }

    // Prune old entries
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(-this.MAX_ENTRIES);
    }

    return fullEntry;
  }

  /**
   * Get recent audit entries
   */
  getRecent(limit: number = 100, filter?: Partial<AuditEntry>): AuditEntry[] {
    let filtered = this.entries;

    if (filter) {
      filtered = filtered.filter((e) => {
        if (filter.category && e.category !== filter.category) return false;
        if (filter.severity && e.severity !== filter.severity) return false;
        if (filter.actor && e.actor !== filter.actor) return false;
        return true;
      });
    }

    return filtered.slice(-limit);
  }

  /**
   * Detect bottleneck from error patterns
   */
  private detectBottleneck(entry: AuditEntry): void {
    // Look for repeated errors in same location
    const recentErrors = this.entries
      .slice(-50)
      .filter(
        (e) =>
          e.severity === "ERROR" &&
          e.action === entry.action &&
          e.category === entry.category
      );

    if (recentErrors.length >= 3) {
      const bottleneck: Bottleneck = {
        id: `btn_${Date.now()}`,
        ts: new Date().toISOString(),
        type: this.categorizeBottleneck(entry),
        location: entry.action,
        impact: this.assessImpact(recentErrors.length),
        description: `Repeated failures in ${entry.action}: ${entry.details.message || "Unknown error"}`,
        suggestedFix: this.suggestFix(entry),
      };

      // Only add if not duplicate
      const isDuplicate = this.bottlenecks.some(
        (b) => b.location === bottleneck.location && b.type === bottleneck.type
      );

      if (!isDuplicate) {
        this.bottlenecks.push(bottleneck);

        // Prune old bottlenecks
        if (this.bottlenecks.length > this.MAX_BOTTLENECKS) {
          this.bottlenecks = this.bottlenecks.slice(-this.MAX_BOTTLENECKS);
        }
      }
    }
  }

  /**
   * Categorize bottleneck type
   */
  private categorizeBottleneck(entry: AuditEntry): Bottleneck["type"] {
    if (entry.category === "CONFIG") return "CONFIG";
    if (entry.category === "EXECUTION") return "INTEGRATION";
    if (entry.action.includes("resource") || entry.action.includes("memory"))
      return "RESOURCE";
    return "DEPENDENCY";
  }

  /**
   * Assess impact level
   */
  private assessImpact(errorCount: number): Bottleneck["impact"] {
    if (errorCount >= 10) return "CRITICAL";
    if (errorCount >= 5) return "HIGH";
    if (errorCount >= 3) return "MEDIUM";
    return "LOW";
  }

  /**
   * Suggest fix based on error pattern
   */
  private suggestFix(entry: AuditEntry): string {
    if (entry.category === "CONFIG") {
      return "Check configuration values and restart service";
    }
    if (entry.category === "EXECUTION") {
      return "Verify integration endpoints and credentials";
    }
    if (entry.action.includes("database")) {
      return "Check database connection and query performance";
    }
    if (entry.action.includes("api")) {
      return "Verify API endpoint availability and rate limits";
    }
    return "Review error logs and system resources";
  }

  /**
   * Get active bottlenecks
   */
  getBottlenecks(
    filter?: { type?: Bottleneck["type"]; impact?: Bottleneck["impact"] }
  ): Bottleneck[] {
    let filtered = this.bottlenecks;

    if (filter) {
      filtered = filtered.filter((b) => {
        if (filter.type && b.type !== filter.type) return false;
        if (filter.impact && b.impact !== filter.impact) return false;
        return true;
      });
    }

    return filtered.sort((a, b) => {
      const impactOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  /**
   * Clear resolved bottleneck
   */
  clearBottleneck(id: string): boolean {
    const index = this.bottlenecks.findIndex((b) => b.id === id);
    if (index >= 0) {
      this.bottlenecks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Generate audit report
   */
  generateReport(
    timeWindowMs: number = 3600000
  ): {
    totalEntries: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    activeBottlenecks: number;
    criticalBottlenecks: number;
  } {
    const now = Date.now();
    const cutoff = now - timeWindowMs;

    const recentEntries = this.entries.filter(
      (e) => new Date(e.ts).getTime() >= cutoff
    );

    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const entry of recentEntries) {
      byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
      bySeverity[entry.severity] = (bySeverity[entry.severity] || 0) + 1;
    }

    const criticalBottlenecks = this.bottlenecks.filter(
      (b) => b.impact === "CRITICAL"
    ).length;

    return {
      totalEntries: recentEntries.length,
      byCategory,
      bySeverity,
      activeBottlenecks: this.bottlenecks.length,
      criticalBottlenecks,
    };
  }

  /**
   * Export audit trail
   */
  exportAuditTrail(): AuditEntry[] {
    return [...this.entries];
  }
}
