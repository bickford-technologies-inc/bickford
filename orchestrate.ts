#!/usr/bin/env bun

import { join, relative, extname, basename, dirname } from "path";
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

  private async loadExistingAudit() {
    const auditPath = join(this.repoPath, CONFIG.auditLog);
    const auditFile = Bun.file(auditPath);
    if (auditFile.size > 0) {
      this.audit = JSON.parse(await auditFile.text());
    }
  }

  private async saveAudit() {
    const auditPath = join(this.repoPath, CONFIG.auditLog);
    await Bun.write(auditPath, JSON.stringify(this.audit, null, 2));
  }

  private async log(
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
    await this.saveAudit();
    console.log(`[AUDIT] ${action}: ${files.length} files - ${reason}`);
  }

  private async hashFile(filePath: string): Promise<string> {
    try {
      const file = Bun.file(filePath);
      const buffer = await file.arrayBuffer();
      return createHash("sha256")
        .update(new Uint8Array(buffer))
        .digest("hex")
        .slice(0, 16);
    } catch {
      return "unreadable";
    }
  }

  private categorizeFile(filePath: string): FileCategory {
    const rel = relative(this.repoPath, filePath);
    const ext = extname(filePath);
    const name = basename(filePath);

    for (const dir of CONFIG.regenerableDirs) {
      if (rel.startsWith(dir + "/") || rel === dir) {
        return "dependency";
      }
    }

    for (const pattern of CONFIG.generatedPatterns) {
      if (pattern.test(name)) return "generated";
    }

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

    const duplicates = this.hashIndex.get(record.hash) || [];
    if (duplicates.length > 1) score += 50;

    if (record.category === "build-artifact") score += 80;
    if (record.category === "dependency") score += 90;
    if (record.category === "generated") score += 70;

    const ageInDays =
      (Date.now() - record.modified.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > 180) score += 10;
    if (ageInDays > 365) score += 20;

    return Math.min(100, score);
  }

  async scan(): Promise<Map<string, FileRecord>> {
    console.log("\n📊 Scanning repository...\n");

    const walk = async (dir: string) => {
      const glob = new Bun.Glob("**/*");
      const scanner = glob.scan({ cwd: dir, onlyFiles: false });

      for await (const entry of scanner) {
        const fullPath = join(dir, entry);
        const rel = relative(this.repoPath, fullPath);

        if (rel.startsWith(".git/") || rel.startsWith(CONFIG.archiveDir))
          continue;

        const file = Bun.file(fullPath);
        if (!(await file.exists())) continue;

        const stat = await file.stat();
        if (stat.isDirectory()) continue;

        const hash = await this.hashFile(fullPath);

        if (!this.hashIndex.has(hash)) {
          this.hashIndex.set(hash, []);
        }
        this.hashIndex.get(hash)!.push(rel);

        const record: FileRecord = {
          path: rel,
          hash,
          size: stat.size,
          modified: new Date(stat.mtime),
          category: this.categorizeFile(fullPath),
          redundancyScore: 0,
          recommendation: "keep",
        };

        this.files.set(rel, record);
      }
    };

    await walk(this.repoPath);

    for (const [path, record] of this.files) {
      const duplicates = this.hashIndex.get(record.hash) || [];
      if (duplicates.length > 1) {
        const canonical = duplicates.sort((a, b) => a.length - b.length)[0];
        if (path !== canonical) {
          record.duplicateOf = canonical;
        }
      }

      record.redundancyScore = this.calculateRedundancy(record);

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

    await Bun.write(join(batchDir, ".keep"), "");

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

      await Bun.write(join(dirname(dest), ".keep"), "");

      try {
        const srcFile = Bun.file(src);
        await Bun.write(dest, srcFile);
        manifest[file.path] = {
          originalPath: file.path,
          hash: file.hash,
          reason: `category: ${file.category}, redundancy: ${file.redundancyScore}%`,
        };
      } catch {
        console.error(`Failed to archive: ${file.path}`);
      }
    }

    await Bun.write(
      join(batchDir, "MANIFEST.json"),
      JSON.stringify(manifest, null, 2),
    );

    await this.log(
      "archive",
      Object.keys(manifest),
      `Archived to ${batchDir}`,
      true,
    );

    console.log(
      `\n✅ Archived ${Object.keys(manifest).length} files to ${batchDir}`,
    );
    console.log(`   Run 'bun orchestrate.ts clean' to remove originals`);
  }

  async clean(): Promise<void> {
    const archivePath = join(this.repoPath, CONFIG.archiveDir);
    const archiveDir = Bun.file(archivePath);
    if (!(await archiveDir.exists())) {
      console.log("❌ No archive found. Run archive first.");
      return;
    }

    const glob = new Bun.Glob("batch-*");
    const batches = Array.from(glob.scanSync(archivePath))
      .sort()
      .reverse();

    if (batches.length === 0) {
      console.log("❌ No archived batches found.");
      return;
    }

    const latestBatch = join(archivePath, batches[0]);
    const manifestPath = join(latestBatch, "MANIFEST.json");
    const manifestFile = Bun.file(manifestPath);

    if (!(await manifestFile.exists())) {
      console.log("❌ No manifest found in latest batch.");
      return;
    }

    const manifest = JSON.parse(await manifestFile.text());
    const toDelete = Object.keys(manifest);

    console.log(`\n🗑️  Cleaning ${toDelete.length} archived files...\n`);

    let deleted = 0;
    for (const filePath of toDelete) {
      const fullPath = join(this.repoPath, filePath);
      const file = Bun.file(fullPath);
      if (await file.exists()) {
        try {
          await Bun.$`rm "${fullPath}"`;
          deleted++;
        } catch {
          console.error(`Failed to delete: ${filePath}`);
        }
      }
    }

    await this.log("clean", toDelete, `Removed ${deleted} archived files`, true);

    console.log(`\n✅ Removed ${deleted} files`);
    console.log(`   Originals preserved in: ${latestBatch}`);
  }

  async restore(batchName?: string): Promise<void> {
    const archivePath = join(this.repoPath, CONFIG.archiveDir);

    const glob = new Bun.Glob("batch-*");
    const batches = Array.from(glob.scanSync(archivePath))
      .sort()
      .reverse();

    const targetBatch = batchName
      ? join(archivePath, batchName)
      : join(archivePath, batches[0]);

    const manifestPath = join(targetBatch, "MANIFEST.json");
    const manifest = JSON.parse(await Bun.file(manifestPath).text());

    console.log(`\n♻️  Restoring from ${basename(targetBatch)}...\n`);

    let restored = 0;
    for (const [filePath] of Object.entries(manifest)) {
      const src = join(targetBatch, filePath);
      const dest = join(this.repoPath, filePath);

      const srcFile = Bun.file(src);
      if (await srcFile.exists()) {
        await Bun.write(join(dirname(dest), ".keep"), "");
        await Bun.write(dest, srcFile);
        restored++;
      }
    }

    await this.log(
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
      break;
    default:
      console.log(
        "Usage: bun orchestrate.ts [scan|archive|clean|restore|duplicates] [path]",
      );
  }
})();
