import { deployFromGit } from "@bickford/vercel/deploy";

export async function POST() {
  const deployment = await deployFromGit({
    project: "bickford",
    repo: "bickford-main",
    org: "bickford-technologies-inc",
  });

  return Response.json({
    status: "started",
    deploymentId: deployment.id,
  });
}
