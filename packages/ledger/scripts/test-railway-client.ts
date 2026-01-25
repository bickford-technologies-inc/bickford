import { getProjects } from "./railway-client.ts";

(async () => {
  try {
    const projects = await getProjects();
    console.log("Railway Projects:", JSON.stringify(projects, null, 2));
  } catch (err) {
    console.error("Railway API error:", err);
  }
})();
