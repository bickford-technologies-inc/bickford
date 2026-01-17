import { vercel } from "./client";

export async function getDeploymentStatus(idOrUrl: string) {
  return vercel.deployments.getDeployment({
    idOrUrl,
    withGitRepoInfo: "true",
  });
}

export async function getDeploymentLogs(idOrUrl: string) {
  return vercel.deployments.getDeploymentEvents({
    idOrUrl,
  });
}
