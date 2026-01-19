if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
  console.warn("⚠️ no GitHub token found; switching to PR-only propagation");
  process.exit(10);
}
console.log("✅ GitHub token available");
