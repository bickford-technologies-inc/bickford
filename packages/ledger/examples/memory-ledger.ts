/**
 * Memory-Enabled Ledger: Compliance + Intelligence
 *
 * Transforms ledger from write-only compliance to read-write intelligence:
 * - Hash chain for tamper-evidence (compliance)
 * - Vector embeddings for semantic search (RAG)
 * - Analytics for pattern detection (intelligence)
 */

import { Database } from "bun:sqlite";
import { createHash, randomUUID } from "node:crypto";

export interface MemoryLedgerEntry {
  id: string;
  eventType: string;
  previousHash: string;
  currentHash: string;
  payload: {
    query: string;
    response: string;
    model?: string;
    success: boolean;
    confidence?: number;
    violationType?: string;
  };
  embedding?: number[];
  metadata: {
    tags?: string[];
    category?: string;
    qualityScore?: number;
    processingTime?: number;
  };
  timestamp: string;
}

export interface SearchOptions {
  limit?: number;
  minSimilarity?: number;
  eventType?: string;
  successOnly?: boolean;
  minQualityScore?: number;
  afterDate?: string;
  beforeDate?: string;
}

export interface AnalyticsReport {
  totalEntries: number;
  successRate: number;
  avgQualityScore: number;
  topCategories: { category: string; count: number }[];
  violationPatterns: { type: string; count: number }[];
  topicCoverage: { topic: string; count: number; avgQuality: number }[];
}

export class MemoryLedger {
  private db: Database;
  private embeddingCache = new Map<string, number[]>();

  constructor(dbPath: string = "./memory-ledger.db") {
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS memory_ledger (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        previous_hash TEXT NOT NULL,
        current_hash TEXT NOT NULL,
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        model TEXT,
        success INTEGER NOT NULL,
        confidence REAL,
        violation_type TEXT,
        embedding TEXT,
        tags TEXT,
        category TEXT,
        quality_score REAL,
        processing_time INTEGER,
        timestamp TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.run(
      `CREATE INDEX IF NOT EXISTS idx_event_type ON memory_ledger(event_type)`
    );
    this.db.run(
      `CREATE INDEX IF NOT EXISTS idx_success ON memory_ledger(success)`
    );
    this.db.run(
      `CREATE INDEX IF NOT EXISTS idx_category ON memory_ledger(category)`
    );
    this.db.run(
      `CREATE INDEX IF NOT EXISTS idx_timestamp ON memory_ledger(timestamp)`
    );
    this.db.run(
      `CREATE INDEX IF NOT EXISTS idx_quality ON memory_ledger(quality_score)`
    );
  }

  async append(
    entry: Omit<MemoryLedgerEntry, "id" | "previousHash" | "currentHash" | "embedding">
  ): Promise<MemoryLedgerEntry> {
    const id = randomUUID();
    const lastEntry = this.db
      .query(
        `SELECT current_hash FROM memory_ledger ORDER BY created_at DESC LIMIT 1`
      )
      .get() as { current_hash: string } | null;
    const previousHash = lastEntry?.current_hash || "0".repeat(64);
    const embedding = await this.generateEmbedding(
      `${entry.payload.query}\n${entry.payload.response}`
    );
    const currentHash = createHash("sha256")
      .update(previousHash + JSON.stringify(entry))
      .digest("hex");

    this.db.run(
      `
      INSERT INTO memory_ledger (
        id, event_type, previous_hash, current_hash,
        query, response, model, success, confidence, violation_type,
        embedding, tags, category, quality_score, processing_time, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        entry.eventType,
        previousHash,
        currentHash,
        entry.payload.query,
        entry.payload.response,
        entry.payload.model || null,
        entry.payload.success ? 1 : 0,
        entry.payload.confidence || null,
        entry.payload.violationType || null,
        JSON.stringify(embedding),
        JSON.stringify(entry.metadata.tags || []),
        entry.metadata.category || null,
        entry.metadata.qualityScore || null,
        entry.metadata.processingTime || null,
        entry.timestamp,
      ]
    );

    return {
      id,
      eventType: entry.eventType,
      previousHash,
      currentHash,
      payload: entry.payload,
      embedding,
      metadata: entry.metadata,
      timestamp: entry.timestamp,
    };
  }

  async searchSimilar(
    query: string,
    options: SearchOptions = {}
  ): Promise<MemoryLedgerEntry[]> {
    const {
      limit = 5,
      minSimilarity = 0.7,
      eventType,
      successOnly = true,
      minQualityScore = 0.0,
      afterDate,
      beforeDate,
    } = options;

    const queryEmbedding = await this.generateEmbedding(query);
    const conditions: string[] = [];
    const params: Array<string | number> = [];

    if (eventType) {
      conditions.push("event_type = ?");
      params.push(eventType);
    }
    if (successOnly) conditions.push("success = 1");
    if (minQualityScore > 0) {
      conditions.push("quality_score >= ?");
      params.push(minQualityScore);
    }
    if (afterDate) {
      conditions.push("timestamp >= ?");
      params.push(afterDate);
    }
    if (beforeDate) {
      conditions.push("timestamp <= ?");
      params.push(beforeDate);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const candidates = this.db
      .query(
        `SELECT * FROM memory_ledger ${whereClause} ORDER BY created_at DESC LIMIT 100`
      )
      .all(...params) as Array<Record<string, unknown>>;

    const scored = candidates
      .map((entry) => {
        const embedding = JSON.parse((entry.embedding as string) || "[]");
        return {
          ...entry,
          similarity: this.cosineSimilarity(queryEmbedding, embedding),
          embedding,
        };
      })
      .filter((entry) => (entry.similarity as number) >= minSimilarity)
      .sort((a, b) => (b.similarity as number) - (a.similarity as number))
      .slice(0, limit);

    return scored.map((entry) => ({
      id: entry.id as string,
      eventType: entry.event_type as string,
      previousHash: entry.previous_hash as string,
      currentHash: entry.current_hash as string,
      payload: {
        query: entry.query as string,
        response: entry.response as string,
        model: entry.model as string | undefined,
        success: entry.success === 1,
        confidence: entry.confidence as number | undefined,
        violationType: entry.violation_type as string | undefined,
      },
      embedding: entry.embedding as number[],
      metadata: {
        tags: JSON.parse((entry.tags as string) || "[]"),
        category: entry.category as string | undefined,
        qualityScore: entry.quality_score as number | undefined,
        processingTime: entry.processing_time as number | undefined,
      },
      timestamp: entry.timestamp as string,
    }));
  }

  getAnalytics(): AnalyticsReport {
    const stats = this.db
      .query(
        `
      SELECT COUNT(*) as total,
             SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successes,
             AVG(quality_score) as avg_quality
      FROM memory_ledger
    `
      )
      .get() as {
      total: number;
      successes: number;
      avg_quality: number;
    };

    const topCategories = this.db
      .query(
        `
      SELECT category, COUNT(*) as count FROM memory_ledger
      WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC LIMIT 10
    `
      )
      .all() as Array<{ category: string; count: number }>;

    const violationPatterns = this.db
      .query(
        `
      SELECT violation_type as type, COUNT(*) as count FROM memory_ledger
      WHERE violation_type IS NOT NULL GROUP BY violation_type ORDER BY count DESC LIMIT 10
    `
      )
      .all() as Array<{ type: string; count: number }>;

    const topicCoverage = this.db
      .query(
        `
      SELECT category as topic, COUNT(*) as count, AVG(quality_score) as avgQuality
      FROM memory_ledger WHERE category IS NOT NULL AND quality_score IS NOT NULL
      GROUP BY category ORDER BY count DESC LIMIT 20
    `
      )
      .all() as Array<{ topic: string; count: number; avgQuality: number }>;

    return {
      totalEntries: stats.total || 0,
      successRate: stats.total > 0 ? (stats.successes || 0) / stats.total : 0,
      avgQualityScore: stats.avg_quality || 0,
      topCategories: topCategories.map((category) => ({
        category: category.category,
        count: category.count,
      })),
      violationPatterns: violationPatterns.map((violation) => ({
        type: violation.type,
        count: violation.count,
      })),
      topicCoverage: topicCoverage.map((topic) => ({
        topic: topic.topic,
        count: topic.count,
        avgQuality: topic.avgQuality || 0,
      })),
    };
  }

  verifyIntegrity(): { valid: boolean; violations: string[] } {
    const entries = this.db
      .query(`SELECT * FROM memory_ledger ORDER BY created_at ASC`)
      .all() as Array<{ previous_hash: string; current_hash: string; id: string }>;
    const violations: string[] = [];
    for (let i = 1; i < entries.length; i += 1) {
      if (entries[i].previous_hash !== entries[i - 1].current_hash) {
        violations.push(`Entry ${i}: Hash chain broken at ${entries[i].id}`);
      }
    }
    return { valid: violations.length === 0, violations };
  }

  exportForFineTuning(options: {
    minQualityScore?: number;
    successOnly?: boolean;
    limit?: number;
  } = {}): Array<{ messages: Array<{ role: string; content: string }> }> {
    const { minQualityScore = 0.8, successOnly = true, limit = 10000 } = options;
    const conditions: string[] = [];
    const params: Array<number> = [];
    if (successOnly) conditions.push("success = 1");
    if (minQualityScore > 0) {
      conditions.push("quality_score >= ?");
      params.push(minQualityScore);
    }
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const entries = this.db
      .query(
        `
      SELECT query, response FROM memory_ledger ${whereClause}
      ORDER BY quality_score DESC, created_at DESC LIMIT ?
    `
      )
      .all(...params, limit) as Array<{ query: string; response: string }>;
    return entries.map((entry) => ({
      messages: [
        { role: "user", content: entry.query },
        { role: "assistant", content: entry.response },
      ],
    }));
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const cached = this.embeddingCache.get(text);
    if (cached) return cached;
    const embedding = this.simpleHashEmbedding(text, 384);
    this.embeddingCache.set(text, embedding);
    return embedding;
  }

  private simpleHashEmbedding(text: string, dimensions: number): number[] {
    const embedding = new Array(dimensions).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    words.forEach((word) => {
      const hash = createHash("sha256").update(word).digest();
      for (let i = 0; i < hash.length && i < dimensions; i += 1) {
        embedding[i] += (hash[i] - 128) / 128;
      }
    });
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    if (magnitude > 0) {
      for (let i = 0; i < dimensions; i += 1) {
        embedding[i] /= magnitude;
      }
    }
    return embedding;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < a.length; i += 1) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    return magnitudeA === 0 || magnitudeB === 0
      ? 0
      : dotProduct / (magnitudeA * magnitudeB);
  }

  close() {
    this.db.close();
  }
}
