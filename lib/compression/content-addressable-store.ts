import { createHash } from "crypto";

export interface CompressionMetrics {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  deduplicationHits: number;
  hashCollisions: number;
  uniqueContentBlocks: number;
}

export interface CompressedPayload {
  contentHash: string; // SHA-256 of content
  metadata: {
    originalSize: number;
    compressedSize: number;
    timestamp: string;
  };
}

export class ContentAddressableStore {
  private contentStore = new Map<string, unknown>();
  private metrics: CompressionMetrics = {
    originalSize: 0,
    compressedSize: 0,
    ratio: 0,
    deduplicationHits: 0,
    hashCollisions: 0,
    uniqueContentBlocks: 0,
  };

  compress(data: unknown): CompressedPayload {
    const originalSize = JSON.stringify(data).length;
    const contentHash = this.computeHash(data);
    const alreadyStored = this.contentStore.has(contentHash);
    if (alreadyStored) {
      this.metrics.deduplicationHits++;
      this.metrics.compressedSize += 1;
    } else {
      this.contentStore.set(contentHash, data);
      this.metrics.uniqueContentBlocks++;
      this.metrics.compressedSize += originalSize;
    }
    this.metrics.originalSize += originalSize;
    this.metrics.ratio =
      1 - this.metrics.compressedSize / this.metrics.originalSize;
    return {
      contentHash,
      metadata: {
        originalSize,
        compressedSize: alreadyStored ? 1 : originalSize,
        timestamp: new Date().toISOString(),
      },
    };
  }

  decompress(payload: CompressedPayload): unknown {
    const content = this.contentStore.get(payload.contentHash);
    if (!content) {
      throw new Error(`Content not found for hash: ${payload.contentHash}`);
    }
    return content;
  }

  verify(original: unknown, decompressed: unknown): boolean {
    const originalHash = this.computeHash(original);
    const decompressedHash = this.computeHash(decompressed);
    return originalHash === decompressedHash;
  }

  getMetrics(): CompressionMetrics {
    return { ...this.metrics };
  }

  calculateSavings(pricePerGB = 0.023): number {
    const originalCostPerMonth = (this.metrics.originalSize / 1e9) * pricePerGB;
    const compressedCostPerMonth =
      (this.metrics.compressedSize / 1e9) * pricePerGB;
    const monthlySavings = originalCostPerMonth - compressedCostPerMonth;
    return monthlySavings * 12; // Annual savings
  }

  private computeHash(content: unknown): string {
    const hash = createHash("sha256");
    hash.update(JSON.stringify(content));
    return hash.digest("hex");
  }

  reset(): void {
    this.contentStore.clear();
    this.metrics = {
      originalSize: 0,
      compressedSize: 0,
      ratio: 0,
      deduplicationHits: 0,
      hashCollisions: 0,
      uniqueContentBlocks: 0,
    };
  }
}
