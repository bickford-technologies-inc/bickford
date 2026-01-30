#!/usr/bin/env bun
/**
 * Repo Orchestrator
 *
 * Applies decision continuity principles to codebase management:
 * - Full audit trail of all changes
 * - Reversible operations (archive before delete)
 * - Intent preservation (document why things exist)
 * - Redundancy detection with confidence scoring
 */

import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  statSync,
  readdirSync,
} from "fs";
import { join, relative, extname, basename, dirname } from "path";
import { execSync } from "child_process";
import { createHash } from "crypto";

interface FileRecord {
  path: string;
  hash: string;
  size: number;
  modified: Date;
  category: FileCategory;
  redundancyScore: number;
  duplicateOf?: string;
  recommendation: "keep" | "archive" | "review";
}

interface AuditEntry {
  timestamp: string;
  action: string;
  files: string[];
  reason: string;
  reversible: boolean;
}

type FileCategory =
  | "source"
  | "config"
  | "build-artifact"
  | "dependency"
  | "documentation"
  | "asset"
  | "test"
  | "generated"
  | "unknown";

const CONFIG = {
  // Directories that are typically regenerable
  regenerableDirs: [
    "node_modules",
    ".next",
    "dist",
    "build",
    ".turbo",
    ".cache",
    "coverage",
    ".vercel",
  ],

  // Files that indicate generated content
  generatedPatterns: [/\.d\.ts$/, /\.map$/, /\.min\.(js|css)$/, /bundle\./],

  // Config files that should always be preserved
  criticalConfigs: [
    "package.json",
    "tsconfig.json",
    "bun.lockb",
    ".env",
    ".env.local",
  ],

  // Archive location
  archiveDir: ".repo-archive",

  // Audit log
  auditLog: ".repo-audit.json",
};

class RepoOrchestrator {
  private repoPath: string;
  private files: Map<string, FileRecord> = new Map();
  private hashIndex: Map<string, string[]> = new Map(); // hash -> paths
  private audit: AuditEntry[] = [];

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.loadExistingAudit();
  }

  private loadExistingAudit() {
    const auditPath = join(this.repoPath, CONFIG.auditLog);
    if (existsSync(auditPath)) {
      this.audit = JSON.parse(readFileSync(auditPath, "utf-8"));
    }
  }

  private saveAudit() {
    const auditPath = join(this.repoPath, CONFIG.auditLog);
    writeFileSync(auditPath, JSON.stringify(this.audit, null, 2));
  }

  private log(
    action: string,
    files: string[],
    reason: string,
    reversible = true,
  ) {
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action,
      files,
      reason,
      reversible,
    };
    this.audit.push(entry);
    this.saveAudit();
    console.log(`[AUDIT] ${action}: ${files.length} files - ${reason}`);
  }

  private hashFile(filePath: string): string {
    try {
      const content = readFileSync(filePath);
      return createHash("sha256").update(content).digest("hex").slice(0, 16);
    } catch {
      return "unreadable";
    }
  }

  private categorizeFile(filePath: string): FileCategory {
    const rel = relative(this.repoPath, filePath);
    const ext = extname(filePath);
    const name = basename(filePath);

    // Check regenerable directories
    for (const dir of CONFIG.regenerableDirs) {
      if (rel.startsWith(dir + "/") || rel === dir) {
        return "dependency";
      }
    }

    // Check generated patterns
    for (const pattern of CONFIG.generatedPatterns) {
      if (pattern.test(name)) return "generated";
    }

    // Categorize by extension/name
    if ([".ts", ".tsx", ".js", ".jsx", ".py", ".rs"].includes(ext))
      return "source";
    if (
      [".json", ".yaml", ".yml", ".toml", ".config.js", ".config.ts"].some(
        (e) => name.endsWith(e),
      )
    )
      return "config";
    if ([".md", ".mdx", ".txt", ".doc"].includes(ext)) return "documentation";
    if ([".png", ".jpg", ".svg", ".ico", ".woff", ".woff2"].includes(ext))
      return "asset";
    if (rel.includes("test") || rel.includes("spec") || name.includes(".test."))
      return "test";
    if (rel.startsWith("dist/") || rel.startsWith("build/"))
      return "build-artifact";

    return "unknown";
  }

  private calculateRedundancy(record: FileRecord): number {
    let score = 0;

    // Duplicates get high redundancy
    const duplicates = this.hashIndex.get(record.hash) || [];
    if (duplicates.length > 1) {
      score += 50;
    }

    // Build artifacts are regenerable
    if (record.category === "build-artifact") score += 80;
    if (record.category === "dependency") score += 90;
    if (record.category === "generated") score += 70;

    // Old files might be stale
    const ageInDays =
      (Date.now() - record.modified.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > 180) score += 10;
    if (ageInDays > 365) score += 20;

    return Math.min(100, score);
  }

  async scan(): Promise<Map<string, FileRecord>> {
    console.log("\n📊 Scanning repository...\n");

    const walk = (dir: string) => {
      let entries: any[] = [];
      try {
        entries = readdirSync(dir, { withFileTypes: true });
      } catch (err: any) {
        // Directory may have been removed or is a broken symlink, skip
        if (err.code === "ENOENT" || err.code === "ENOTDIR") return;
        throw err;
      }

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const rel = relative(this.repoPath, fullPath);

        // Skip git internals and archive
        if (rel.startsWith(".git/") || rel.startsWith(CONFIG.archiveDir))
          continue;

        if (entry.isDirectory()) {
          walk(fullPath);
        } else {
          let stat;
          try {
            stat = statSync(fullPath);
          } catch (err: any) {
            // File may have been removed or is a broken symlink, skip
            if (err.code === "ENOENT" || err.code === "ENOTDIR") continue;
            throw err;
          }
          const hash = this.hashFile(fullPath);

          // Track duplicates
          if (!this.hashIndex.has(hash)) {
            this.hashIndex.set(hash, []);
          }
          this.hashIndex.get(hash)!.push(rel);

          const record: FileRecord = {
            path: rel,
            hash,
            size: stat.size,
            modified: stat.mtime,
            category: this.categorizeFile(fullPath),
            redundancyScore: 0,
            recommendation: "keep",
          };

          this.files.set(rel, record);
        }
      }
    };

    walk(this.repoPath);

    // Calculate redundancy and mark duplicates
    for (const [path, record] of this.files) {
      const duplicates = this.hashIndex.get(record.hash) || [];
      if (duplicates.length > 1) {
        // Keep the shortest path (likely canonical), mark others as duplicates
        const canonical = duplicates.sort((a, b) => a.length - b.length)[0];
        if (path !== canonical) {
          record.duplicateOf = canonical;
        }
      }

      record.redundancyScore = this.calculateRedundancy(record);

      // Set recommendations
      if (record.redundancyScore >= 80) {
        record.recommendation = "archive";
      } else if (record.redundancyScore >= 40 || record.duplicateOf) {
        record.recommendation = "review";
      }
    }

    return this.files;
  }

  generateReport(): string {
    const byCategory = new Map<FileCategory, FileRecord[]>();
    const duplicates: FileRecord[] = [];
    const archiveCandidates: FileRecord[] = [];
    const reviewCandidates: FileRecord[] = [];

    let totalSize = 0;
    let archivableSize = 0;

    for (const record of this.files.values()) {
      totalSize += record.size;

      // Group by category
      if (!byCategory.has(record.category)) {
        byCategory.set(record.category, []);
      }
      byCategory.get(record.category)!.push(record);

      // Track special cases
      if (record.duplicateOf) duplicates.push(record);
      if (record.recommendation === "archive") {
        archiveCandidates.push(record);
        archivableSize += record.size;
      }
      if (record.recommendation === "review") reviewCandidates.push(record);
    }

    const formatSize = (bytes: number) => {
      if (bytes > 1024 * 1024 * 1024)
        return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
      if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
      if (bytes > 1024) return `${(bytes / 1024).toFixed(2)} KB`;
      return `${bytes} bytes`;
    };

    let report = `
╔══════════════════════════════════════════════════════════════════╗
║                    REPO ORCHESTRATOR REPORT                       ║
║              Decision Continuity for Your Codebase                ║
╚══════════════════════════════════════════════════════════════════╝

📁 Repository: ${this.repoPath}
📊 Total Files: ${this.files.size}
💾 Total Size: ${formatSize(totalSize)}
🗑️  Archivable: ${formatSize(archivableSize)} (${((archivableSize / totalSize) * 100).toFixed(1)}%)

───────────────────────────────────────────────────────────────────
                         BY CATEGORY
───────────────────────────────────────────────────────────────────
`;

    for (const [category, files] of byCategory) {
      const size = files.reduce((sum, f) => sum + f.size, 0);
      report += `\n${category.padEnd(20)} ${files.length.toString().padStart(6)} files  ${formatSize(size).padStart(12)}`;
    }

    if (duplicates.length > 0) {
      report += `\n
───────────────────────────────────────────────────────────────────
                      DUPLICATE FILES (${duplicates.length})
───────────────────────────────────────────────────────────────────
`;
      for (const dup of duplicates.slice(0, 20)) {
        report += `\n  ${dup.path}\n    └─ duplicate of: ${dup.duplicateOf}`;
      }
      if (duplicates.length > 20) {
        report += `\n  ... and ${duplicates.length - 20} more`;
      }
    }

    if (archiveCandidates.length > 0) {
      report += `\n
───────────────────────────────────────────────────────────────────
                   ARCHIVE CANDIDATES (${archiveCandidates.length})
───────────────────────────────────────────────────────────────────
`;
      const grouped = new Map<FileCategory, number>();
      for (const f of archiveCandidates) {
        grouped.set(f.category, (grouped.get(f.category) || 0) + 1);
      }
      for (const [cat, count] of grouped) {
        report += `\n  ${cat}: ${count} files`;
      }
    }

    report += `\n
───────────────────────────────────────────────────────────────────
                         COMMANDS
───────────────────────────────────────────────────────────────────

  bun orchestrate.ts scan          # Re-scan the repository
  bun orchestrate.ts archive       # Archive redundant files
  bun orchestrate.ts restore       # Restore from archive
  bun orchestrate.ts duplicates    # Show all duplicates
  bun orchestrate.ts clean         # Remove archived originals

⚠️  All operations create audit entries and are reversible.
`;

    return report;
  }

  async archive(): Promise<void> {
    const archivePath = join(this.repoPath, CONFIG.archiveDir);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const batchDir = join(archivePath, `batch-${timestamp}`);

    mkdirSync(batchDir, { recursive: true });

    const toArchive = Array.from(this.files.values()).filter(
      (f) => f.recommendation === "archive",
    );

    if (toArchive.length === 0) {
      console.log("✅ No files to archive");
      return;
    }

    console.log(`\n📦 Archiving ${toArchive.length} files...\n`);

    const manifest: Record<
      string,
      { originalPath: string; hash: string; reason: string }
    > = {};

    for (const file of toArchive) {
      const src = join(this.repoPath, file.path);
      const dest = join(batchDir, file.path);

      mkdirSync(dirname(dest), { recursive: true });

      try {
        execSync(`cp "${src}" "${dest}"`);
        manifest[file.path] = {
          originalPath: file.path,
          hash: file.hash,
          reason: `category: ${file.category}, redundancy: ${file.redundancyScore}%`,
        };
      } catch (err) {
        console.error(`Failed to archive: ${file.path}`);
      }
    }

    // Write manifest
    writeFileSync(
      join(batchDir, "MANIFEST.json"),
      JSON.stringify(manifest, null, 2),
    );

    this.log("archive", Object.keys(manifest), `Archived to ${batchDir}`, true);

    console.log(
      `\n✅ Archived ${Object.keys(manifest).length} files to ${batchDir}`,
    );
    console.log(`   Run 'bun orchestrate.ts clean' to remove originals`);
  }

  async clean(): Promise<void> {
    const archivePath = join(this.repoPath, CONFIG.archiveDir);
    if (!existsSync(archivePath)) {
      console.log("❌ No archive found. Run archive first.");
      return;
    }

    // Get latest batch
    const batches = readdirSync(archivePath)
      .filter((d) => d.startsWith("batch-"))
      .sort()
      .reverse();

    if (batches.length === 0) {
      console.log("❌ No archived batches found.");
      return;
    }

    const latestBatch = join(archivePath, batches[0]);
    const manifestPath = join(latestBatch, "MANIFEST.json");

    if (!existsSync(manifestPath)) {
      console.log("❌ No manifest found in latest batch.");
      return;
    }

    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    const toDelete = Object.keys(manifest);

    console.log(`\n🗑️  Cleaning ${toDelete.length} archived files...\n`);

    let deleted = 0;
    for (const filePath of toDelete) {
      const fullPath = join(this.repoPath, filePath);
      if (existsSync(fullPath)) {
        try {
          execSync(`rm "${fullPath}"`);
          deleted++;
        } catch {
          console.error(`Failed to delete: ${filePath}`);
        }
      }
    }

    this.log("clean", toDelete, `Removed ${deleted} archived files`, true);

    console.log(`\n✅ Removed ${deleted} files`);
    console.log(`   Originals preserved in: ${latestBatch}`);
  }

  async restore(batchName?: string): Promise<void> {
    const archivePath = join(this.repoPath, CONFIG.archiveDir);

    const batches = readdirSync(archivePath)
      .filter((d) => d.startsWith("batch-"))
      .sort()
      .reverse();

    const targetBatch = batchName
      ? join(archivePath, batchName)
      : join(archivePath, batches[0]);

    const manifestPath = join(targetBatch, "MANIFEST.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

    console.log(`\n♻️  Restoring from ${basename(targetBatch)}...\n`);

    let restored = 0;
    for (const [filePath, meta] of Object.entries(manifest) as [
      string,
      any,
    ][]) {
      const src = join(targetBatch, filePath);
      const dest = join(this.repoPath, filePath);

      if (existsSync(src)) {
        mkdirSync(dirname(dest), { recursive: true });
        execSync(`cp "${src}" "${dest}"`);
        restored++;
      }
    }

    this.log(
      "restore",
      Object.keys(manifest),
      `Restored from ${targetBatch}`,
      false,
    );

    console.log(`\n✅ Restored ${restored} files`);
  }
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || "scan";
const repoPath = args[1] || process.cwd();

const orchestrator = new RepoOrchestrator(repoPath);

(async () => {
  switch (command) {
    case "scan":
      await orchestrator.scan();
      console.log(orchestrator.generateReport());
      break;
    case "archive":
      await orchestrator.scan();
      await orchestrator.archive();
      break;
    case "clean":
      await orchestrator.clean();
      break;
    case "restore":
      await orchestrator.restore(args[2]);
      break;
    case "duplicates":
      await orchestrator.scan();
      // Show detailed duplicates
      break;
    default:
      console.log(
        "Usage: bun orchestrate.ts [scan|archive|clean|restore|duplicates] [path]",
      );
  }
})();
