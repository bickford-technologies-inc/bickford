// @ts-check
import { appendFileSync, existsSync, writeFileSync } from "fs";

const LOG_PATH = "outputs/automation.log";
const MAX_LOG_SIZE = 1024 * 1024; // 1MB

// Ensure log file exists (self-healing)
if (!existsSync(LOG_PATH)) {
  try {
    writeFileSync(LOG_PATH, "");
  } catch {}
}

// TODO: Make log rotation size configurable.
if (existsSync(LOG_PATH)) {
  try {
    const stats = require("fs").statSync(LOG_PATH);
    if (stats.size > MAX_LOG_SIZE) {
      require("fs").renameSync(LOG_PATH, LOG_PATH + ".old");
      writeFileSync(LOG_PATH, "");
    }
  } catch {}
}

/**
 * Log a message to console and automation.log
 * @param {string} message
 */
export function log(message: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  try {
    appendFileSync(LOG_PATH, line + "\n");
  } catch {}
}

/**
 * Log an error to console and automation.log
 * @param {string} message
 * @param {unknown} [err]
 */
export function logError(message: string, err?: unknown) {
  const timestamp = new Date().toISOString();
  const errorMsg =
    `[${timestamp}] ERROR: ${message}` +
    (err ? ` | ${err instanceof Error ? err.stack : String(err)}` : "");
  console.error(errorMsg);
  try {
    appendFileSync(LOG_PATH, errorMsg + "\n");
  } catch {}
}

// TODO: Add log rotation for large log files in future.
// EXTENSION POINT: Add remote log streaming or Slack integration here.
