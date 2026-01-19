/**
 * scripts/assert-vercel-binding.ts
 *
 * PURPOSE:
 *   Fail CI builds for non-canonical Vercel projects.
 *
 * SAFE DEFAULT:
 *   If not running on Vercel (no VERCEL_PROJECT_NAME), exit 0.
 */

const ALLOWED = new Set(["bickford"]);

const project = process.env.VERCEL_PROJECT_NAME;

if (project && !ALLOWED.has(project)) {
  console.error(
    `ERROR: Vercel project "${project}" is not authorized to build this repo.`
  );
  process.exit(1);
}

process.exit(0);
