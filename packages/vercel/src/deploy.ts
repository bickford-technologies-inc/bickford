import { vercel } from "./client";

export async function deployFromGit({
  project,
  repo,
  ref = "main",
  org,
}: {
  project: string;
  repo: string;
  ref?: string;
  org: string;
}) {
  const deployment = await vercel.deployments.createDeployment({
    requestBody: {
      name: project,
      target: "production",
      gitSource: {
        type: "github",
        repo,
        ref,
        org,
      },
    },
  });

  return deployment;
}
