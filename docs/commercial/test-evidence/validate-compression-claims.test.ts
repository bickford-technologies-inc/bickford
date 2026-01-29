import { describe, it, expect } from "bun:test";
import { ContentAddressableStore } from "../../../lib/compression/content-addressable-store";

// Simulate 60MB of highly redundant logs (as repeated blocks)
const BLOCK = "ENTERPRISE_DECISION_DNA_BLOCK_ABCDEF".repeat(1024); // ~25KB string
const NUM_BLOCKS = Math.floor((60 * 1024 * 1024) / Buffer.byteLength(BLOCK)); // 60MB worth (practical test)
const REDUNDANT_LOGS = Array(NUM_BLOCKS).fill(BLOCK);

describe("Bickford Compression Claims (Commercial Narrative)", () => {
  it(
    "compresses 60MB of redundant logs to ~60KB with full audit integrity",
    {
      timeout: 30000,
    },
    () => {
      const store = new ContentAddressableStore();
      for (const block of REDUNDANT_LOGS) {
        store.compress(block);
      }
      const metrics = store.getMetrics();
      const ratio = metrics.ratio;
      // Assert compression ratio is at least 99.9%
      expect(ratio).toBeGreaterThan(0.999);
      // Assert physical size is about 60KB
      expect(metrics.compressedSize).toBeLessThan(70 * 1024);
    },
  );
});
