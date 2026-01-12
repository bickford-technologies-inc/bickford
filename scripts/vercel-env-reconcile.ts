import fetch from "node-fetch";

const token = process.env.VERCEL_TOKEN!;
const projectId = process.env.VERCEL_PROJECT_ID!;
const teamId = process.env.VERCEL_TEAM_ID!;
const databaseUrl = process.env.DATABASE_URL_PROD!;

if (!token || !projectId || !teamId || !databaseUrl) {
  throw new Error("❌ Missing required environment variables");
}

const API = "https://api.vercel.com";

async function upsertEnv(key: string, value: string) {
  // Delete any existing env (all environments)
  await fetch(`${API}/v9/projects/${projectId}/env?teamId=${teamId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key }),
  });

  // Create canonical env
  const res = await fetch(
    `${API}/v9/projects/${projectId}/env?teamId=${teamId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        value,
        type: "encrypted",
        target: ["production"],
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`❌ Failed to set ${key}: ${text}`);
  }

  console.log(`✅ ${key} reconciled`);
}

(async () => {
  await upsertEnv("DATABASE_URL", databaseUrl);
})();
