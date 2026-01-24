/**
 * Bickford Intent Translation Engine
 *
 * Translates chat input into Vercel-compatible TypeScript
 * Guarantees zero TypeScript errors by validating before acceptance
 * Rejects invalid translations with visual proof
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const execAsync = promisify(exec);

// ============================================================================
// Types
// ============================================================================

export interface StructuredIntent {
  action: 'implement' | 'fix' | 'refactor' | 'add' | 'remove' | 'update';
  target: {
    type: 'feature' | 'route' | 'component' | 'schema' | 'api' | 'util';
    path: string;
    name: string;
  };
  constraints: string[];
  context: {
    framework: 'nextjs' | 'react' | 'prisma' | 'node';
    language: 'typescript';
    dependencies: string[];
  };
  requirements: {
    testing: boolean;
    documentation: boolean;
    types: boolean;
    esm: boolean;
  };
}

export interface VercelOutput {
  files: Array<{
    path: string;
    content: string;
    type: 'code' | 'test' | 'types' | 'config';
  }>;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export interface ValidationError {
  type: 'typescript' | 'esm' | 'exports' | 'nextjs' | 'build';
  file: string;
  line: number;
  message: string;
  suggestion: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  screenshots: string[];
  buildOutput?: string;
}

export interface ClaudeClient {
  messages: {
    create: (payload: {
      model: string;
      max_tokens: number;
      messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
      }>;
    }) => Promise<{
      content: Array<{
        type: 'text' | string;
        text?: string;
      }>;
    }>;
  };
}

export interface OpenAIClient {
  chat: {
    completions: {
      create: (payload: {
        model: string;
        temperature: number;
        max_tokens: number;
        messages: Array<{
          role: 'user' | 'assistant' | 'system';
          content: string;
        }>;
      }) => Promise<{
        choices: Array<{
          message: {
            content: string | null;
          };
        }>;
      }>;
    };
  };
}

export interface RejectionResponse {
  accepted: false;
  reason: string;
  errors: ValidationError[];
  screenshots: Array<{
    title: string;
    description: string;
    image: string;
  }>;
  suggestions: string[];
  documentation: string[];
}

// ============================================================================
// Intent Translation Engine
// ============================================================================

export class IntentTranslationEngine {
  private claude: ClaudeClient;
  private openai: OpenAIClient;

  constructor(clients: {
    claude: ClaudeClient;
    openai: OpenAIClient;
  }) {
    this.claude = clients.claude;
    this.openai = clients.openai;
  }

  async process(chatInput: string): Promise<{
    accepted: boolean;
    output?: VercelOutput;
    rejection?: RejectionResponse;
  }> {
    try {
      // Phase 1: Parse intent
      console.log('[Intent Translator] Phase 1: Parsing intent...');
      const intent = await this.parseIntent(chatInput);

      // Phase 2: Translate to Vercel language
      console.log('[Intent Translator] Phase 2: Translating to Vercel language...');
      const vercelOutput = await this.translateToVercel(intent);

      // Phase 3: Validate TypeScript
      console.log('[Intent Translator] Phase 3: Validating TypeScript...');
      const validation = await this.validate(vercelOutput);

      if (validation.valid) {
        console.log('[Intent Translator] ✅ Translation successful');
        return {
          accepted: true,
          output: vercelOutput
        };
      } else {
        console.log(`[Intent Translator] ❌ Translation failed (${validation.errors.length} errors)`);
        const rejection = this.formatRejection(intent, validation);
        return {
          accepted: false,
          rejection
        };
      }
    } catch (error) {
      console.error('[Intent Translator] Fatal error:', error);
      throw error;
    }
  }

  // ==========================================================================
  // Phase 1: Intent Parser
  // ==========================================================================

  private async parseIntent(chatInput: string): Promise<StructuredIntent> {
    const response = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Parse this chat input into structured intent for Vercel deployment.

Chat Input: "${chatInput}"

Return ONLY valid JSON matching this exact schema:
{
  "action": "implement|fix|refactor|add|remove|update",
  "target": {
    "type": "feature|route|component|schema|api|util",
    "path": "relative/path/from/repo/root",
    "name": "descriptive name"
  },
  "constraints": ["list", "of", "constraints"],
  "context": {
    "framework": "nextjs|react|prisma|node",
    "language": "typescript",
    "dependencies": ["dep1", "dep2"]
  },
  "requirements": {
    "testing": true,
    "documentation": true,
    "types": true,
    "esm": true
  }
}

CRITICAL: Always set language to "typescript" and esm to true for Vercel compatibility.
NO markdown, NO backticks, ONLY raw JSON.`
      }]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const intent: StructuredIntent = JSON.parse(content);

    // Enforce Vercel requirements
    intent.context.language = 'typescript';
    intent.requirements.types = true;
    intent.requirements.esm = true;

    return intent;
  }

  // ==========================================================================
  // Phase 2: Vercel Translator
  // ==========================================================================

  private async translateToVercel(intent: StructuredIntent): Promise<VercelOutput> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.1,
      max_tokens: 8192,
      messages: [{
        role: 'system',
        content: `You are a Vercel TypeScript expert. Generate ONLY code that:

1. Uses ESM syntax with .js extensions in imports
2. Exports all types explicitly
3. Follows Next.js 14+ conventions
4. Passes TypeScript strict mode
5. Has no 'any' types
6. Includes comprehensive tests

CRITICAL VERCEL RULES:
- Import paths: import { X } from "./file.js" (always .js extension)
- Export all types: export interface X, export type Y
- Next.js routes: app/api/route.ts with export async function GET/POST
- No default exports in API routes
- Use "use server" directive for server actions
- TypeScript strict mode enabled

Return ONLY valid JSON (NO markdown, NO backticks):
{
  "files": [
    {
      "path": "relative/path/file.ts",
      "content": "complete file content here",
      "type": "code|test|types|config"
    }
  ],
  "dependencies": {"package": "version"},
  "scripts": {"script-name": "command"}
}`
      }, {
        role: 'user',
        content: `Generate Vercel-compatible TypeScript for:

Action: ${intent.action}
Target: ${intent.target.type} at ${intent.target.path}
Name: ${intent.target.name}
Framework: ${intent.context.framework}
Dependencies: ${intent.context.dependencies.join(', ')}
Constraints: ${intent.constraints.join(', ')}

Requirements:
- Testing: ${intent.requirements.testing}
- Documentation: ${intent.requirements.documentation}
- Types: ${intent.requirements.types}
- ESM: ${intent.requirements.esm}

Generate complete, working code. NO placeholders. NO TODOs.`
      }]
    });

    const content = response.choices[0].message.content || '{}';
    const output: VercelOutput = JSON.parse(content);

    // Enforce ESM syntax
    output.files = output.files.map(file => ({
      ...file,
      content: this.enforceESM(file.content)
    }));

    return output;
  }

  private enforceESM(content: string): string {
    // Fix import paths to include .js extension
    let fixed = content.replace(
      /from\s+["'](\.[^"']+)["']/g,
      (_match, importPath) => `from "${this.normalizeImportPath(importPath)}"`
    );

    // Ensure all interfaces and types are exported
    fixed = fixed.replace(
      /^(interface|type)\s+(\w+)/gm,
      (match) => {
        if (!match.startsWith('export')) {
          return `export ${match}`;
        }
        return match;
      }
    );

    return fixed;
  }

  private normalizeImportPath(importPath: string): string {
    if (importPath.endsWith('.js') || importPath.endsWith('.json') || importPath.includes('.css')) {
      return importPath;
    }

    if (/\.(ts|tsx|jsx|mts|cts)$/.test(importPath)) {
      return importPath.replace(/\.(ts|tsx|jsx|mts|cts)$/, '.js');
    }

    return `${importPath}.js`;
  }

  // ==========================================================================
  // Phase 3: Validator
  // ==========================================================================

  private async validate(output: VercelOutput): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Create temp directory
    const tempDir = await this.createTempDir(output);

    try {
      // Validate ESM syntax
      const esmErrors = this.validateESM(output);
      errors.push(...esmErrors);

      // Validate exports
      const exportErrors = this.validateExports(output);
      errors.push(...exportErrors);

      // Validate Next.js conventions
      const nextErrors = this.validateNextJS(output);
      errors.push(...nextErrors);

      // Run TypeScript compiler
      const tscResult = await this.runTypeScriptCheck(tempDir);
      if (!tscResult.success) {
        errors.push(...this.parseTSCErrors(tscResult.output));
      }

      // Try build (if no TypeScript errors)
      let buildOutput = '';
      if (errors.length === 0) {
        const buildResult = await this.runBuild(tempDir);
        buildOutput = buildResult.output;
        if (!buildResult.success) {
          errors.push(...this.parseBuildErrors(buildResult.output));
        }
      }

      // Generate screenshots if errors exist
      const screenshots = errors.length > 0
        ? await this.generateErrorScreenshots(errors, buildOutput)
        : [];

      return {
        valid: errors.length === 0,
        errors,
        screenshots,
        buildOutput
      };

    } finally {
      await this.cleanup(tempDir);
    }
  }

  private validateESM(output: VercelOutput): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const file of output.files) {
      const lines = file.content.split('\n');

      lines.forEach((line, index) => {
        const importMatch = line.match(/from\s+["'](\.[^"']+)["']/);
        if (importMatch) {
          const importPath = importMatch[1];
          if (!importPath.endsWith('.js') && !importPath.endsWith('.json') && !importPath.includes('.css')) {
            errors.push({
              type: 'esm',
              file: file.path,
              line: index + 1,
              message: `Import path must include .js extension: ${importPath}`,
              suggestion: `Change to: from "${this.normalizeImportPath(importPath)}"`
            });
          }
        }
      });
    }

    return errors;
  }

  private validateExports(output: VercelOutput): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const file of output.files) {
      if (file.type === 'types' || file.path.includes('types')) {
        const lines = file.content.split('\n');

        lines.forEach((line, index) => {
          if (/^(interface|type)\s+\w+/.test(line) && !/^export\s+/.test(line)) {
            errors.push({
              type: 'exports',
              file: file.path,
              line: index + 1,
              message: `Type/interface must be exported: ${line.trim()}`,
              suggestion: `Add 'export' keyword: export ${line.trim()}`
            });
          }
        });
      }
    }

    return errors;
  }

  private validateNextJS(output: VercelOutput): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const file of output.files) {
      if (file.path.includes('/app/') && file.path.endsWith('/route.ts')) {
        const hasHTTPMethod = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/.test(file.content);

        if (!hasHTTPMethod) {
          errors.push({
            type: 'nextjs',
            file: file.path,
            line: 1,
            message: 'Next.js route must export at least one HTTP method handler',
            suggestion: 'Add: export async function GET(request: Request) { ... }'
          });
        }
      }
    }

    return errors;
  }

  private async runTypeScriptCheck(dir: string): Promise<{success: boolean; output: string}> {
    try {
      const { stdout, stderr } = await execAsync(
        'npx tsc --noEmit --pretty --skipLibCheck',
        { cwd: dir, timeout: 30000 }
      );
      return { success: true, output: stdout + stderr };
    } catch (error: any) {
      return { success: false, output: (error.stdout || '') + (error.stderr || '') };
    }
  }

  private async runBuild(dir: string): Promise<{success: boolean; output: string}> {
    try {
      const { stdout, stderr } = await execAsync(
        'npm run build',
        { cwd: dir, timeout: 60000 }
      );
      return { success: true, output: stdout + stderr };
    } catch (error: any) {
      return { success: false, output: (error.stdout || '') + (error.stderr || '') };
    }
  }

  private parseTSCErrors(output: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/(.+\.ts)\((\d+),\d+\): error TS\d+: (.+)/);
      if (match) {
        errors.push({
          type: 'typescript',
          file: match[1],
          line: parseInt(match[2], 10),
          message: match[3],
          suggestion: this.getSuggestionForTSError(match[3])
        });
      }
    }

    return errors;
  }

  private parseBuildErrors(output: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (output.includes('Failed to compile') || output.includes('Error:')) {
      errors.push({
        type: 'build',
        file: 'build',
        line: 0,
        message: 'Build failed - see output for details',
        suggestion: 'Fix TypeScript errors and retry'
      });
    }

    return errors;
  }

  private getSuggestionForTSError(message: string): string {
    if (message.includes('Cannot find module')) {
      return 'Add .js extension to import path or install missing dependency';
    }
    if (message.includes('has no exported member')) {
      return 'Add export keyword to type/interface definition';
    }
    if (message.includes("'any'")) {
      return 'Replace any with specific type';
    }
    return 'Review TypeScript documentation for this error';
  }

  // ==========================================================================
  // Screenshot Generation
  // ==========================================================================

  private async generateErrorScreenshots(
    errors: ValidationError[],
    buildOutput: string
  ): Promise<string[]> {
    const screenshots: string[] = [];

    // Group errors by file
    const errorsByFile = errors.reduce((acc, error) => {
      if (!acc[error.file]) acc[error.file] = [];
      acc[error.file].push(error);
      return acc;
    }, {} as Record<string, ValidationError[]>);

    // Generate one screenshot per file
    for (const [file, fileErrors] of Object.entries(errorsByFile)) {
      const screenshot = this.createErrorHTML(file, fileErrors, buildOutput);
      screenshots.push(Buffer.from(screenshot).toString('base64'));
    }

    return screenshots;
  }

  private createErrorHTML(
    file: string,
    errors: ValidationError[],
    buildOutput: string
  ): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Monaco', monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 30px;
      line-height: 1.6;
    }
    .header {
      background: #252526;
      padding: 20px;
      border-left: 4px solid #f48771;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    h1 {
      color: #f48771;
      font-size: 24px;
      margin-bottom: 10px;
    }
    .file-path {
      color: #4ec9b0;
      font-size: 16px;
    }
    .error {
      background: #252526;
      border-left: 4px solid #f48771;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .error-type {
      color: #f48771;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 12px;
      margin-bottom: 5px;
    }
    .error-line {
      color: #9cdcfe;
      margin: 5px 0;
    }
    .error-message {
      color: #ce9178;
      margin: 10px 0;
      padding: 10px;
      background: #1e1e1e;
      border-radius: 3px;
    }
    .suggestion {
      background: #1e1e1e;
      padding: 10px;
      border-radius: 3px;
      margin: 10px 0;
      border-left: 2px solid #4ec9b0;
    }
    .suggestion-label {
      color: #4ec9b0;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .suggestion-code {
      color: #dcdcaa;
      font-family: 'Monaco', monospace;
      font-size: 13px;
    }
    .build-output {
      margin-top: 30px;
      background: #252526;
      padding: 15px;
      border-radius: 4px;
    }
    .build-output h3 {
      color: #569cd6;
      margin-bottom: 10px;
      font-size: 16px;
    }
    pre {
      background: #1e1e1e;
      padding: 10px;
      border-radius: 3px;
      overflow-x: auto;
      font-size: 12px;
      color: #d4d4d4;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚫 Vercel Build Failed - TypeScript Errors</h1>
    <div class="file-path">File: ${file}</div>
  </div>
  
  ${errors.map((error) => `
    <div class="error">
      <div class="error-type">${error.type} Error</div>
      <div class="error-line">Line ${error.line}</div>
      <div class="error-message">${this.escapeHTML(error.message)}</div>
      <div class="suggestion">
        <div class="suggestion-label">💡 Suggestion:</div>
        <div class="suggestion-code">${this.escapeHTML(error.suggestion)}</div>
      </div>
    </div>
  `).join('')}
  
  ${buildOutput ? `
    <div class="build-output">
      <h3>Build Output:</h3>
      <pre>${this.escapeHTML(buildOutput.slice(0, 1000))}</pre>
    </div>
  ` : ''}
</body>
</html>`;
  }

  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // Rejection Formatter
  // ==========================================================================

  private formatRejection(
    intent: StructuredIntent,
    validation: ValidationResult
  ): RejectionResponse {
    const errorCounts = validation.errors.reduce((acc, err) => {
      acc[err.type] = (acc[err.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const parts: string[] = [];
    Object.entries(errorCounts).forEach(([type, count]) => {
      parts.push(`${count} ${type} error${count > 1 ? 's' : ''}`);
    });

    return {
      accepted: false,
      reason: `Cannot translate to Vercel language: ${parts.join(', ')}`,
      errors: validation.errors,
      screenshots: validation.screenshots.map((screenshot, i) => ({
        title: `Error Visualization ${i + 1}`,
        description: this.describeErrors(validation.errors.slice(i * 3, (i + 1) * 3)),
        image: screenshot
      })),
      suggestions: this.generateSuggestions(intent, validation.errors),
      documentation: this.getRelevantDocs(validation.errors)
    };
  }

  private describeErrors(errors: ValidationError[]): string {
    return errors.map(e =>
      `${e.type.toUpperCase()}: ${e.file}:${e.line} - ${e.message}`
    ).join('\n');
  }

  private generateSuggestions(
    intent: StructuredIntent,
    errors: ValidationError[]
  ): string[] {
    const suggestions: string[] = [];
    const errorTypes = new Set(errors.map(e => e.type));

    if (errorTypes.has('typescript')) {
      suggestions.push('Review TypeScript types and ensure all imports are resolved');
    }
    if (errorTypes.has('esm')) {
      suggestions.push('Add .js extensions to all relative imports');
      suggestions.push('Example: import { X } from "./file.js" not "./file"');
    }
    if (errorTypes.has('exports')) {
      suggestions.push('Add export keyword before all interface/type declarations');
    }
    if (errorTypes.has('nextjs')) {
      suggestions.push('Follow Next.js 14+ conventions for routes');
      suggestions.push('Use: export async function GET(request: Request)');
    }

    return suggestions;
  }

  private getRelevantDocs(errors: ValidationError[]): string[] {
    const docs = new Set<string>();

    for (const error of errors) {
      switch (error.type) {
        case 'typescript':
          docs.add('https://www.typescriptlang.org/docs/handbook/modules.html');
          break;
        case 'esm':
          docs.add('https://nodejs.org/api/esm.html#mandatory-file-extensions');
          break;
        case 'nextjs':
          docs.add('https://nextjs.org/docs/app/building-your-application/routing/route-handlers');
          break;
        case 'exports':
          docs.add('https://www.typescriptlang.org/docs/handbook/modules.html#export');
          break;
      }
    }

    return Array.from(docs);
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private async createTempDir(output: VercelOutput): Promise<string> {
    const tmpDir = path.join(os.tmpdir(), `vercel-validation-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`);
    await fs.mkdir(tmpDir, { recursive: true });

    // Write files
    for (const file of output.files) {
      const filePath = path.join(tmpDir, file.path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content);
    }

    // Write package.json
    await fs.writeFile(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        name: 'temp-validation',
        version: '1.0.0',
        type: 'module',
        scripts: { build: 'tsc --noEmit', ...output.scripts },
        dependencies: output.dependencies
      }, null, 2)
    );

    // Write tsconfig.json
    await fs.writeFile(
      path.join(tmpDir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2022'],
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        }
      }, null, 2)
    );

    return tmpDir;
  }

  private async cleanup(dir: string): Promise<void> {
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (error) {
      console.warn('[Intent Translator] Cleanup failed:', error);
    }
  }
}

export default IntentTranslationEngine;
