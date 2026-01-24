import { exec } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { GeneratedFile, ValidationError, ValidationResult } from "../types.js";

const execAsync = promisify(exec);

export class BuildValidator {
  readonly name = "build";

  async validate(files: GeneratedFile[]): Promise<ValidationResult> {
    const tmpDir = path.join(os.tmpdir(), `build-validation-${Date.now()}`);
    await fs.mkdir(tmpDir, { recursive: true });

    try {
      for (const file of files) {
        const filePath = path.join(tmpDir, file.path);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, file.content);
      }

      await this.createNextJSStructure(tmpDir);

      const { stdout, stderr } = await execAsync("npm run build", {
        cwd: tmpDir,
        timeout: 120000,
      }).catch((error: { stdout?: string; stderr?: string }) => ({
        stdout: error.stdout ?? "",
        stderr: error.stderr ?? "",
      }));

      const output = `${stdout}${stderr}`;
      const success = !output.includes("Failed to compile") && !output.includes("Error:");

      return {
        valid: success,
        errors: success ? [] : this.parseBuildErrors(output),
        output,
      };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  private async createNextJSStructure(dir: string): Promise<void> {
    await fs.writeFile(
      path.join(dir, "package.json"),
      JSON.stringify(
        {
          name: "build-validation",
          scripts: {
            build: "next build",
          },
          dependencies: {
            next: "^14.0.0",
            react: "^18.0.0",
            "react-dom": "^18.0.0",
          },
        },
        null,
        2,
      ),
    );

    await fs.writeFile(
      path.join(dir, "next.config.js"),
      "/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nexport default nextConfig;\n",
    );

    await fs.writeFile(
      path.join(dir, "tsconfig.json"),
      JSON.stringify(
        {
          compilerOptions: {
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            plugins: [{ name: "next" }],
            paths: { "@/*": ["./*"] },
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
          exclude: ["node_modules"],
        },
        null,
        2,
      ),
    );

    await fs.writeFile(path.join(dir, "next-env.d.ts"), "/// <reference types=\"next\" />\n");

    const appDir = path.join(dir, "app");
    await fs.mkdir(appDir, { recursive: true });
    await fs.writeFile(
      path.join(appDir, "layout.tsx"),
      "import type { ReactNode } from \"react\";\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return <html><body>{children}</body></html>;\n}\n",
    );

    await fs.writeFile(
      path.join(appDir, "page.tsx"),
      "export default function Page() { return <div>Test</div>; }\n",
    );
  }

  private parseBuildErrors(output: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (output.includes("Failed to compile")) {
      errors.push({
        type: "build",
        file: "build",
        line: 0,
        message: "Next.js build failed",
        suggestion: "Review build output for specific errors",
      });
    }

    return errors;
  }
}
