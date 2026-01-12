import fetch from "node-fetch";
import fs from "fs";

const token = process.env.VERCEL_TOKEN!;
const projectId = process.env.VERCEL_PROJECT_ID!;
const teamId = process.env.VERCEL_TEAM_ID!;

const envs = JSON.parse(fs.readFileSync("env/ENV_SURFACE.json", "utf8"));

async function createEnv(key: string, value: string, target: string[]) {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        value,
        target,
        type: "encrypted",
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create env ${key}: ${text}`);
  }

  console.log(`✓ provisioned ${key}`);
}

(async () => {
  for (const [key, def] of Object.entries(envs)) {
    await createEnv(key, (def as any).value, (def as any).environments);
  }
})();
