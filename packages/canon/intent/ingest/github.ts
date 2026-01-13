import { normalizeIntent } from "../normalize";
import { Intent } from "../types";

// GitHub issue ingestion: parse issue payload, normalize, and emit Intent
export function ingestFromGitHub(issue: any): Intent {
  return normalizeIntent({
    goal: issue.title || "",
    constraints:
      issue.labels
        ?.map((l: any) => l.name)
        .filter((n: string) => n !== "intent") || [],
    canonRefs: [],
    urgency: "normal",
    source: "github",
    evidence: { issueNumber: issue.number, url: issue.html_url },
    createdAt: issue.created_at,
  });
}
