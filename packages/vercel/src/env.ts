import { vercel } from "./client";
import { OneTarget } from "@vercel/sdk/models/operations/createprojectenv";

export async function upsertEnvVar({
  project,
  key,
  value,
  targets,
  encrypted = false,
}: {
  project: string;
  key: string;
  value: string;
  targets: OneTarget[];
  encrypted?: boolean;
}) {
  return vercel.projects.createProjectEnv({
    idOrName: project,
    upsert: "true",
    requestBody: {
      key,
      value,
      target: targets,
      type: encrypted ? "encrypted" : "plain",
    },
  });
}
