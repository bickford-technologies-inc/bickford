#!/usr/bin/env bun

import {
  getProjects,
  triggerDeploy,
} from "../packages/ledger/scripts/railway-client.ts";

async function main() {
  console.log("🚀 Starting Railway deployment...");
  const projects = await getProjects();
  const project = projects.projects.edges.find(
    (p) => p.node.name === "bickford" || p.node.name === "tender-generosity",
  );
  if (!project) throw new Error("Project not found");
  console.log(`✓ Found project: ${project.node.name}`);

  await triggerDeploy(project.node.id);
  console.log(
    "✅ Deployment triggered! Monitor progress at https://railway.app/project/" +
      project.node.id,
  );
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
