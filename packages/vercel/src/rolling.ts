import { vercel } from "./client";

export async function configureRollingRelease(project: string) {
  return vercel.rollingRelease.updateRollingReleaseConfig({
    idOrName: project,
    requestBody: {
      target: "production",
      stages: [
        { targetPercentage: 5, duration: 300 },
        { targetPercentage: 25, duration: 600 },
        { targetPercentage: 50, duration: 900 },
        { targetPercentage: 100 },
      ],
    },
  });
}
