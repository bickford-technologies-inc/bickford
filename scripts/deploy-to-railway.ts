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

  // Debug: print latest deployment ID
  const { getLatestDeploymentId } =
    await import("../packages/ledger/scripts/railway-client.ts");
  const deploymentId = await getLatestDeploymentId(project.node.id);
  console.log(`Latest deployment ID: ${deploymentId}`);

  await triggerDeploy(project.node.id);
  console.log(
    "✅ Deployment triggered! Monitor progress at https://railway.app/project/" +
      project.node.id,
  );
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  if (String(err).includes("GRAPHQL_VALIDATION_FAILED")) {
    console.error(
      "The deployment mutation may be outdated. Please update the mutation in railway-client.ts to match the current Railway API schema.",
    );
  }
  process.exit(1);
});
