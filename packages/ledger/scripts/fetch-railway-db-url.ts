import { getProjects, getProjectEnvs } from "./railway-client.ts";

async function main() {
  const projects = await getProjects();
  const project = projects.projects.edges.find(
    (p) => p.node.name === "bickford" || p.node.name === "tender-generosity",
  );
  if (!project) throw new Error("Project not found");

  const envs = await getProjectEnvs(project.node.id);
  const prodEnv = envs.project.environments.edges.find(
    (e: any) => e.node.name === "production",
  );
  if (!prodEnv) throw new Error("Production environment not found");

  const dbVar = prodEnv.node.variables.edges.find(
    (v: any) => v.node.name === "DATABASE_URL",
  );
  const dbUrl = dbVar?.node.contents;
  if (!dbUrl)
    throw new Error("DATABASE_URL not found in production environment");

  console.log("DATABASE_URL=" + dbUrl);
}

main().catch(console.error);
