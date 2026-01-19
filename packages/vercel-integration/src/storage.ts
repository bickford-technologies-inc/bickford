import { createVercelClient } from "./client";

export async function listStores(teamId: string) {
  const client = createVercelClient();

  const res = await client.request({
    method: "GET",
    path: `/v2/teams/${teamId}/stores`,
  });

  return res.stores ?? [];
}
