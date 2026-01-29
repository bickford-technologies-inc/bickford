# RUNNER_SETUP.md

## Self-Hosted Runner Pre-Flight Check & Setup

### 1. Obtain a Valid Runner Token

- Go to your repository or organization → Settings → Actions → Runners → New self-hosted runner → Copy the registration token.

### 2. Validate the Token Before Registration

Run the pre-flight check script to ensure your token is valid:

```bash
chmod +x runner-preflight-check.sh
./runner-preflight-check.sh <OWNER> <REPO> <TOKEN>
```

- Replace `<OWNER>`, `<REPO>`, and `<TOKEN>` with your GitHub organization/user, repository name, and runner registration token.
- If you see `[PASS] Runner token is valid.`, proceed to register the runner.
- If you see `[FAIL] Runner token is INVALID or expired`, obtain a new token and try again.

### 3. Register the Runner

Follow the GitHub UI instructions or run:

```bash
./config.sh --url https://github.com/<OWNER>/<REPO> --token <TOKEN>
```

### 4. Troubleshooting

- If you repeatedly see HTTP 403 or token errors, always re-run the pre-flight check.
- Ensure your token is not expired and has not been used already (GitHub tokens are single-use).
- If using a CI/CD system other than GitHub, adapt the pre-flight check to your provider's API.

### 5. Automation

- Integrate `runner-preflight-check.sh` into your CI/CD pipeline to block misconfigured runner registrations before they fail.
- For Railway deployments, the token is now validated automatically using the Railway API before any deployment or automation step. If the token is invalid or expired, the process will abort with a clear error.

---

**This process prevents deployment failures due to invalid runner tokens and ensures smooth, automated runner setup for both GitHub and Railway.**
