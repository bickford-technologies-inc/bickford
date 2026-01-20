/**
 * ASSERT: Vercel project binding
 * Purpose:
 *   Ensure this repo is only built by the canonical Vercel project.
 * Safe:
 *   No side effects
 *   No imports
 *   Deterministic
 */

const allowedProjects = ["bickford"];

const project = process.env.VERCEL_PROJECT_NAME;

if (project && !allowedProjects.includes(project)) {
  console.error(
    `ERROR: Vercel project "${project}" is not authorized to build this repository.`,
  );
  process.exit(1);
}

process.exit(0);
