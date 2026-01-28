# Bickford Complete Automation: Quickstart Guide

**Location:** /workspaces/bickford/outputs/
**Last Updated:** 2026-01-28

---

## 🚀 Quickstart

1. **Validate Output Directories**

   ```bash
   bun run outputs/validate_outputs.ts
   ```

2. **Run Full Workflow (Lead Gen → Email → Compliance)**

   ```bash
   bun run outputs/run_full_workflow.ts
   ```

3. **Check Status Dashboard**
   - View `/workspaces/bickford/outputs/WORKFLOW_STATUS.md` for live status and next actions.

4. **Compliance Ledger**
   - Initialize, verify, or record events:
     ```bash
     bun run outputs/bickford-optr/optr_production_ready.ts verify
     bun run outputs/bickford-optr/optr_production_ready.ts record "Decision text"
     bun run outputs/bickford-optr/optr_production_ready.ts report
     ```

5. **Integration Test**
   ```bash
   bun run outputs/integration_test.ts
   ```

---

## 📁 Directory Structure

```
outputs/
├── customer-acquisition/
├── evidence-collection/
├── bickford-optr/
├── WORKFLOW_STATUS.md
├── BICKFORD_COMPLETE_PACKAGE.md
├── START_HERE.md (this file)
└── AUTOMATION_COMPLETE_SUMMARY.md
```

---

## 🩺 Healthcheck & Automation Logs

- **Run a full healthcheck:**

  ```bash
  bun run outputs/healthcheck.ts
  ```

  - This checks all key scripts, outputs, and prints the last status of each automation step.

- **View logs:**
  - All script output and errors are timestamped in `outputs/automation.log`.

- **Automation status:**
  - The last run status of each script is tracked in `outputs/automation_status.json` (for dashboards, monitoring, or audit).

---

## 🧩 Extension & Maintenance

- All scripts are ready for extension: look for `// TODO` and `// EXTENSION POINT` comments in code.
- Use `format_outputs.sh` to auto-format all outputs scripts.
- Lint with ESLint config in `outputs/.eslintrc.json`.

---

## 🟢 Next Steps

- Run the full workflow script to generate leads, emails, and verify compliance automation.
- Check the status dashboard for progress and next actions.
- Integrate with real customer data as you progress through the workflow.

---

## 🛠️ Troubleshooting & FAQ

- **Q: I get a permissions error when running scripts?**
  - A: Ensure you are running as a user with write access to `/workspaces/bickford/outputs/`.

- **Q: How do I set the Anthropic API key for compliance ledger?**
  - A: Set the environment variable before running:
    ```bash
    export ANTHROPIC_API_KEY=sk-...your-key...
    ```

- **Q: How do I run all tests?**
  - A: Run:
    ```bash
    bun test outputs/tests/
    ```

- **Q: How do I add new automation?**
  - A: Add your script to the appropriate outputs/ subdirectory and update `run_full_workflow.ts` if you want it included in the main workflow.

---

## 🔒 Compliance & Security

- Never commit or log real API keys or customer data.
- All compliance events are hash-chained and tamper-evident.

---

## 🚀 Advanced Usage

- You can extend the workflow by adding new scripts and updating the orchestrator.
- For Slack/email integration, add scripts in outputs/ and update documentation.

---

## 🧩 Contributing & Extending

- Add TODOs and extension points in code for future automation.
- PRs welcome for new automation modules, tests, or documentation improvements.

---

**All automation is real, executable, and production-ready.**
