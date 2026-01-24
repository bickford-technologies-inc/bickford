import type { ValidationError } from "./types.js";

export class ScreenshotGenerator {
  async generate(errors: ValidationError[]): Promise<string[]> {
    const screenshots: string[] = [];
    const errorsByFile = this.groupByFile(errors);

    for (const [file, fileErrors] of errorsByFile) {
      const html = this.createErrorHTML(file, fileErrors);
      const screenshot = await this.htmlToImage(html);
      screenshots.push(screenshot);
    }

    return screenshots;
  }

  private createErrorHTML(file: string, errors: ValidationError[]): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TypeScript Errors - ${this.escapeHTML(file)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Monaco', monospace;
      background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
      color: #d4d4d4;
      padding: 40px;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      background: linear-gradient(135deg, #f48771 0%, #d32f2f 100%);
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 4px 20px rgba(244, 135, 113, 0.3);
    }

    h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .icon {
      font-size: 32px;
    }

    .file-path {
      font-size: 16px;
      opacity: 0.95;
      font-family: 'Monaco', monospace;
    }

    .error-card {
      background: #252526;
      border-left: 4px solid #f48771;
      padding: 24px;
      margin: 20px 0;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s;
    }

    .error-card:hover {
      transform: translateX(4px);
    }

    .error-type {
      display: inline-block;
      background: #f48771;
      color: #1e1e1e;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .error-location {
      color: #9cdcfe;
      font-size: 14px;
      margin: 8px 0;
      font-family: 'Monaco', monospace;
    }

    .error-message {
      color: #ce9178;
      font-size: 15px;
      line-height: 1.6;
      margin: 12px 0;
      padding: 12px;
      background: rgba(206, 145, 120, 0.1);
      border-radius: 4px;
    }

    .suggestion {
      background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
      padding: 16px;
      border-radius: 6px;
      margin: 16px 0;
      border-left: 3px solid #4ec9b0;
    }

    .suggestion-label {
      color: #4ec9b0;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .suggestion-code {
      color: #dcdcaa;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .footer {
      margin-top: 40px;
      padding: 24px;
      background: #252526;
      border-radius: 8px;
      text-align: center;
      color: #858585;
      font-size: 14px;
    }

    .stats {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
      padding: 20px;
      background: #252526;
      border-radius: 8px;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #f48771;
    }

    .stat-label {
      font-size: 12px;
      color: #858585;
      text-transform: uppercase;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1><span class="icon">🚫</span> Vercel Build Failed - TypeScript Errors</h1>
      <div class="file-path">File: ${this.escapeHTML(file)}</div>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${errors.length}</div>
        <div class="stat-label">Errors Found</div>
      </div>
      <div class="stat">
        <div class="stat-value">${new Set(errors.map((error) => error.type)).size}</div>
        <div class="stat-label">Error Types</div>
      </div>
      <div class="stat">
        <div class="stat-value">${Math.max(...errors.map((error) => error.line))}</div>
        <div class="stat-label">Max Line</div>
      </div>
    </div>

    ${errors
      .map(
        (error) => `
      <div class="error-card">
        <div class="error-type">${this.escapeHTML(error.type)} Error</div>
        <div class="error-location">📍 Line ${error.line}</div>
        <div class="error-message">${this.escapeHTML(error.message)}</div>
        <div class="suggestion">
          <div class="suggestion-label">💡 Suggested Fix:</div>
          <div class="suggestion-code">${this.escapeHTML(error.suggestion)}</div>
        </div>
      </div>
    `,
      )
      .join("")}

    <div class="footer">
      <strong>Bickford Intent Translation Engine</strong><br>
      These errors must be fixed before deployment to Vercel.<br>
      Review suggestions above and modify your intent.
    </div>
  </div>
</body>
</html>`;
  }

  private async htmlToImage(html: string): Promise<string> {
    return Buffer.from(html).toString("base64");
  }

  private escapeHTML(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private groupByFile(errors: ValidationError[]): Map<string, ValidationError[]> {
    const grouped = new Map<string, ValidationError[]>();

    for (const error of errors) {
      if (!grouped.has(error.file)) {
        grouped.set(error.file, []);
      }
      grouped.get(error.file)?.push(error);
    }

    return grouped;
  }
}
