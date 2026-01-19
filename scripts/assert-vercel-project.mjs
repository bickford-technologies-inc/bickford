import process from "process";

const allowed = ["bickford"];

const project = process.env.VERCEL_PROJECT_NAME;

if (project && !allowed.includes(project)) {
  console.error(
    `ERROR: Vercel project "${project}" is not authorized to build this repo.`,
  );
  process.exit(1);
}
