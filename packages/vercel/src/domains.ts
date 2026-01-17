import { vercel } from "./client";

export async function addDomain(project: string, domain: string) {
  return vercel.projects.addProjectDomain({
    idOrName: project,
    requestBody: { name: domain },
  });
}
