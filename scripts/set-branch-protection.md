# Setting Up Branch Protection and Auto-Merge (Manual Step)

> ⚠️ GitHub branch protection and auto-merge settings must be configured via the web UI or API by a repository admin. This cannot be fully automated by a script in this repo due to required permissions.

## Steps:

1. Go to **GitHub → Settings → Branches → Branch protection rules**.
2. Edit or create a rule for the `main` branch.
3. Enable:
   - [x] **Allow auto-merge**
   - [x] **Require status checks to pass before merging** (ensure your CI checks are green)
   - [ ] **Require pull request reviews before merging** (optional: leave unchecked for full automation)
4. Save the settings.

For API automation, see: https://docs.github.com/en/rest/branches/branch-protection

---

Once this is set, the automation scripts and workflows in this repo will be able to auto-merge and deploy PRs without human intervention.
