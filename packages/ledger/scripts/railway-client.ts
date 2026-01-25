// Bun-native Railway API client (minimal, extensible)

const RAILWAY_API_URL = "https://backboard.railway.app/graphql/v2";
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;

if (!RAILWAY_TOKEN) {
  throw new Error("RAILWAY_TOKEN not set in environment");
}

async function railwayGraphQL(
  query: string,
  variables: Record<string, any> = {},
) {
  const res = await fetch(RAILWAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RAILWAY_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (data.errors)
    throw new Error("Railway API error: " + JSON.stringify(data.errors));
  return data.data;
}

// Example: Fetch all projects
export async function getProjects() {
  const query = `query { projects { edges { node { id name } } } }`;
  return railwayGraphQL(query);
}

// Example: Fetch environment variables for a project
export async function getEnvVars(projectId: string) {
  const query = `query($id: String!) { project(id: $id) { environments { edges { node { id name variables { name value } } } } } }`;
  return railwayGraphQL(query, { id: projectId });
}

// Example: Update an environment variable
export async function setEnvVar(envId: string, name: string, value: string) {
  const mutation = `mutation($input: UpdateEnvironmentVariableInput!) { updateEnvironmentVariable(input: $input) { environmentVariable { id name value } } }`;
  return railwayGraphQL(mutation, {
    input: { environmentId: envId, name, value },
  });
}

// Example: Trigger a deploy
export async function triggerDeploy(projectId: string) {
  const mutation = `mutation($id: String!) { deployProject(id: $id) { id status } }`;
  return railwayGraphQL(mutation, { id: projectId });
}

// Fetch plugins for a project (to find Postgres and env vars)
export async function getPlugins(projectId: string) {
  const query = `
    query($id: String!) {
      project(id: $id) {
        plugins {
          edges {
            node {
              id
              name
              type
              environment {
                id
                name
                variables {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  `;
  return railwayGraphQL(query, { id: projectId });
}

// Fetch environments and their variables for a project (with connection/edges/nodes, using 'contents')
export async function getProjectEnvs(projectId: string) {
  const query = `
    query($projectId: String!) {
      project(id: $projectId) {
        environments {
          edges {
            node {
              id
              name
              variables {
                edges {
                  node {
                    name
                    contents
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  return railwayGraphQL(query, { projectId });
}
