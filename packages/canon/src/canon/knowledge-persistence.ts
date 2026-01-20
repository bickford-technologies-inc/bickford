/**
 * Adaptive Self-Organizing Knowledge Persistence
 * TIMESTAMP: 2026-01-19T23:13:00Z
 *
 * Adaptive storage layer that self-organizes based on access patterns,
 * with versioning support and real-time meta-decision logging.
 */

export interface KnowledgeEntry {
  id: string;
  ts: string;
  tenantId: string;
  kind: "CANON" | "EVIDENCE" | "DECISION" | "DENIAL";
  content: unknown;
  version: number;
  previousVersion?: string;
  accessCount: number;
  lastAccessed: string;
  metadata: {
    confidence?: number;
    trust?: number;
    source?: string;
    tags?: string[];
  };
}

export interface MetaDecisionLog {
  id: string;
  ts: string;
  decisionType: "DECIDE" | "PROMOTE" | "NON_INTERFERENCE" | "GATE";
  actionId: string;
  stableKey: string;
  outcome: "APPROVED" | "DENIED";
  reasonCodes: string[];
  features: Record<string, number>;
  score?: number;
  durationMs: number;
}

export interface StorageStrategy {
  hot: boolean; // In-memory (Redis)
  warm: boolean; // Fast access (Postgres)
  cold: boolean; // Archive (S3/File)
}

/**
 * Self-organizing storage adapter that determines optimal storage strategy
 * based on access patterns and data characteristics
 */
export class AdaptiveKnowledgeStore {
  private accessPatterns: Map<string, { count: number; lastAccess: number }> = new Map();
  private readonly HOT_THRESHOLD = 10; // Access 10+ times in recent window
  private readonly WARM_THRESHOLD = 2;
  private readonly COLD_AGE_DAYS = 90;

  /**
   * Determine optimal storage strategy for a knowledge entry
   */
  determineStrategy(entry: KnowledgeEntry): StorageStrategy {
    const pattern = this.accessPatterns.get(entry.id);
    const age = Date.now() - new Date(entry.ts).getTime();
    const ageDays = age / (1000 * 60 * 60 * 24);

    // Hot: Frequently accessed recent data
    const isHot = pattern && pattern.count >= this.HOT_THRESHOLD && ageDays < 7;
    
    // Warm: Moderately accessed or important recent data
    const isWarm = 
      (pattern && pattern.count >= this.WARM_THRESHOLD) ||
      entry.kind === "CANON" ||
      ageDays < 30;
    
    // Cold: Old data or rarely accessed
    const isCold = ageDays > this.COLD_AGE_DAYS;

    return {
      hot: !!isHot,
      warm: isWarm || !isCold,
      cold: isCold,
    };
  }

  /**
   * Record access and update patterns for self-organization
   */
  recordAccess(id: string): void {
    const existing = this.accessPatterns.get(id);
    this.accessPatterns.set(id, {
      count: (existing?.count || 0) + 1,
      lastAccess: Date.now(),
    });
  }

  /**
   * Prune stale access patterns (cleanup)
   */
  pruneAccessPatterns(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [id, pattern] of this.accessPatterns.entries()) {
      if (now - pattern.lastAccess > maxAgeMs) {
        this.accessPatterns.delete(id);
      }
    }
  }
}

/**
 * Versioned knowledge entry with automatic versioning support
 */
export class VersionedKnowledge {
  /**
   * Create a new version of a knowledge entry
   */
  static createVersion(
    previous: KnowledgeEntry,
    newContent: unknown,
    nowIso: string
  ): KnowledgeEntry {
    return {
      ...previous,
      id: `${previous.id}_v${previous.version + 1}`,
      ts: nowIso,
      content: newContent,
      version: previous.version + 1,
      previousVersion: previous.id,
      accessCount: 0,
      lastAccessed: nowIso,
    };
  }

  /**
   * Retrieve version history chain
   */
  static async getVersionChain(
    currentId: string,
    fetch: (id: string) => Promise<KnowledgeEntry | null>
  ): Promise<KnowledgeEntry[]> {
    const chain: KnowledgeEntry[] = [];
    let current = await fetch(currentId);

    while (current) {
      chain.unshift(current);
      if (!current.previousVersion) break;
      current = await fetch(current.previousVersion);
    }

    return chain;
  }
}

/**
 * Real-time meta-decision logger
 * Captures decision-making process for analysis and learning
 */
export class MetaDecisionLogger {
  private logs: MetaDecisionLog[] = [];
  private readonly MAX_IN_MEMORY = 1000;

  /**
   * Log a meta-decision with timing and outcome
   */
  log(decision: MetaDecisionLog): void {
    this.logs.push(decision);

    // Self-prune to prevent memory bloat
    if (this.logs.length > this.MAX_IN_MEMORY) {
      this.logs = this.logs.slice(-this.MAX_IN_MEMORY);
    }
  }

  /**
   * Get recent decisions for analysis
   */
  getRecent(limit: number = 100): MetaDecisionLog[] {
    return this.logs.slice(-limit);
  }

  /**
   * Analyze decision patterns for learning
   */
  analyzePatterns(): {
    approvalRate: number;
    avgDuration: number;
    topDenialReasons: Array<{ code: string; count: number }>;
    byType: Record<string, { total: number; approved: number; denied: number }>;
  } {
    if (this.logs.length === 0) {
      return {
        approvalRate: 0,
        avgDuration: 0,
        topDenialReasons: [],
        byType: {},
      };
    }

    const approved = this.logs.filter((l) => l.outcome === "APPROVED").length;
    const approvalRate = approved / this.logs.length;

    const avgDuration =
      this.logs.reduce((sum, l) => sum + l.durationMs, 0) / this.logs.length;

    const reasonCounts = new Map<string, number>();
    for (const log of this.logs) {
      if (log.outcome === "DENIED") {
        for (const code of log.reasonCodes) {
          reasonCounts.set(code, (reasonCounts.get(code) || 0) + 1);
        }
      }
    }

    const topDenialReasons = Array.from(reasonCounts.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const byType: Record<string, { total: number; approved: number; denied: number }> = {};
    for (const log of this.logs) {
      if (!byType[log.decisionType]) {
        byType[log.decisionType] = { total: 0, approved: 0, denied: 0 };
      }
      byType[log.decisionType].total++;
      if (log.outcome === "APPROVED") {
        byType[log.decisionType].approved++;
      } else {
        byType[log.decisionType].denied++;
      }
    }

    return {
      approvalRate,
      avgDuration,
      topDenialReasons,
      byType,
    };
  }

  /**
   * Clear old logs (for persistence/archival)
   */
  flush(): MetaDecisionLog[] {
    const toFlush = [...this.logs];
    this.logs = [];
    return toFlush;
  }
}
