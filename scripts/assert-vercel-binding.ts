/**
 * CI Guard: Assert Vercel Binding
 *
 * Purpose:
 * - Ensures this job only runs in Vercel-bound environments
 * - No-op locally
 *
 * Canonical behavior:
 * - If not running in Vercel CI, exit successfully
 * - If running in Vercel CI, assert required env vars exist
 */

function assertVercelBinding() {
  // Not running in Vercel → no-op
  if (!process.env.VERCEL) {
    return;
  }

  // Minimal invariant: project + commit must be present
  const required = ["VERCEL", "VERCEL_GIT_COMMIT_SHA", "VERCEL_PROJECT_ID"];

  const missing = required.filter((k) => !process.env[k]);

  if (missing.length > 0) {
    throw new Error(
      `Vercel binding invariant violated. Missing env vars: ${missing.join(", ")}`,
    );
  }
}

assertVercelBinding();
