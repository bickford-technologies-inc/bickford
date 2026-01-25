// Memory-Enabled Ledger for Bickford: Compliance + Intelligence
import Database from "better-sqlite3";
import { createHash } from "crypto";

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

export class MemoryLedger {
  private db: Database.Database;
  private embeddingCache = new Map<string, number[]>();

  constructor(dbPath: string = "./data/bickford-memory.db") {
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    this.db.exec(`
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
      );
      CREATE INDEX IF NOT EXISTS idx_event_type ON memory_ledger(event_type);
      CREATE INDEX IF NOT EXISTS idx_success ON memory_ledger(success);
    `);
  }

  async append(
    entry: Omit<
      MemoryLedgerEntry,
      "id" | "previousHash" | "currentHash" | "embedding"
    >,
  ): Promise<MemoryLedgerEntry> {
    const id = crypto.randomUUID();
    const lastEntry = this.db
      .prepare(
        `SELECT current_hash FROM memory_ledger ORDER BY created_at DESC LIMIT 1`,
      )
      .get() as { current_hash: string } | null;
    const previousHash = lastEntry?.current_hash || "0".repeat(64);
    const embedding = await this.generateEmbedding(
      `${entry.payload.query}\n${entry.payload.response}`,
    );
    const currentHash = createHash("sha256")
      .update(previousHash + JSON.stringify(entry))
      .digest("hex");
    this.db
      .prepare(
        `
      INSERT INTO memory_ledger (
        id, event_type, previous_hash, current_hash,
        query, response, model, success, confidence, violation_type,
        embedding, tags, category, quality_score, processing_time, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
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
    {
      limit = 5,
      minSimilarity = 0.7,
      eventType,
      successOnly = true,
      minQualityScore = 0.0,
      afterDate,
      beforeDate,
    }: any = {},
  ): Promise<MemoryLedgerEntry[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const conditions: string[] = [];
    const params: any[] = [];
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
      .prepare(
        `SELECT * FROM memory_ledger ${whereClause} ORDER BY created_at DESC LIMIT 100`,
      )
      .all(...params) as any[];
    const scored = candidates
      .map((entry) => ({
        ...entry,
        similarity: this.cosineSimilarity(
          queryEmbedding,
          JSON.parse(entry.embedding || "[]"),
        ),
        embedding: JSON.parse(entry.embedding || "[]"),
      }))
      .filter((entry) => entry.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    return scored.map((entry) => ({
      id: entry.id,
      eventType: entry.event_type,
      previousHash: entry.previous_hash,
      currentHash: entry.current_hash,
      payload: {
        query: entry.query,
        response: entry.response,
        model: entry.model,
        success: entry.success === 1,
        confidence: entry.confidence,
        violationType: entry.violation_type,
      },
      embedding: entry.embedding,
      metadata: {
        tags: JSON.parse(entry.tags || "[]"),
        category: entry.category,
        qualityScore: entry.quality_score,
        processingTime: entry.processing_time,
      },
      timestamp: entry.timestamp,
    }));
  }

  getAnalytics() {
    const stats = this.db
      .prepare(
        `
      SELECT COUNT(*) as total, SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successes, AVG(quality_score) as avg_quality FROM memory_ledger
    `,
      )
      .get() as any;
    const topCategories = this.db
      .prepare(
        `SELECT category, COUNT(*) as count FROM memory_ledger WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC LIMIT 10`,
      )
      .all() as any[];
    const violationPatterns = this.db
      .prepare(
        `SELECT violation_type as type, COUNT(*) as count FROM memory_ledger WHERE violation_type IS NOT NULL GROUP BY violation_type ORDER BY count DESC LIMIT 10`,
      )
      .all() as any[];
    const topicCoverage = this.db
      .prepare(
        `SELECT category as topic, COUNT(*) as count, AVG(quality_score) as avgQuality FROM memory_ledger WHERE category IS NOT NULL AND quality_score IS NOT NULL GROUP BY category ORDER BY count DESC LIMIT 20`,
      )
      .all() as any[];
    return {
      totalEntries: stats.total || 0,
      successRate: stats.total > 0 ? (stats.successes || 0) / stats.total : 0,
      avgQualityScore: stats.avg_quality || 0,
      topCategories: topCategories.map((c) => ({
        category: c.category,
        count: c.count,
      })),
      violationPatterns: violationPatterns.map((v) => ({
        type: v.type,
        count: v.count,
      })),
      topicCoverage: topicCoverage.map((t) => ({
        topic: t.topic,
        count: t.count,
        avgQuality: t.avgQuality || 0,
      })),
    };
  }

  verifyIntegrity(): { valid: boolean; violations: string[] } {
    const entries = this.db
      .prepare(`SELECT * FROM memory_ledger ORDER BY created_at ASC`)
      .all() as any[];
    const violations: string[] = [];
    for (let i = 1; i < entries.length; i++) {
      if (entries[i].previous_hash !== entries[i - 1].current_hash) {
        violations.push(`Entry ${i}: Hash chain broken at ${entries[i].id}`);
      }
    }
    return { valid: violations.length === 0, violations };
  }

  exportForFineTuning({
    minQualityScore = 0.8,
    successOnly = true,
    limit = 10000,
  } = {}) {
    const conditions: string[] = [];
    const params: any[] = [];
    if (successOnly) conditions.push("success = 1");
    if (minQualityScore > 0) {
      conditions.push("quality_score >= ?");
      params.push(minQualityScore);
    }
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const entries = this.db
      .prepare(
        `SELECT query, response FROM memory_ledger ${whereClause} ORDER BY quality_score DESC, created_at DESC LIMIT ?`,
      )
      .all(...params, limit) as any[];
    return entries.map((e) => ({
      messages: [
        { role: "user", content: e.query },
        { role: "assistant", content: e.response },
      ],
    }));
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    if (this.embeddingCache.has(text)) return this.embeddingCache.get(text)!;
    const embedding = this.simpleHashEmbedding(text, 384);
    this.embeddingCache.set(text, embedding);
    return embedding;
  }

  private simpleHashEmbedding(text: string, dimensions: number): number[] {
    const embedding = new Array(dimensions).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    words.forEach((word) => {
      const hash = createHash("sha256").update(word).digest();
      for (let i = 0; i < hash.length && i < dimensions; i++) {
        embedding[i] += (hash[i] - 128) / 128;
      }
    });
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0),
    );
    if (magnitude > 0) {
      for (let i = 0; i < dimensions; i++) embedding[i] /= magnitude;
    }
    return embedding;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0,
      magnitudeA = 0,
      magnitudeB = 0;
    for (let i = 0; i < a.length; i++) {
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
