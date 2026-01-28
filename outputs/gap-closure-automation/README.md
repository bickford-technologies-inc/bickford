# Gap Closure Automation System

This directory contains all automation scripts, evidence, and reports for acquisition gap closure.

## Structure

- `evidence/` — One folder per gap, with professional evidence files
- `reports/` — Final, weekly, and status reports
- `customer-discovery/` — Interview/LOI templates and tracking
- `data-room/` — Due diligence data room structure
- `scripts/` — All automation scripts (TypeScript, Bash)

## Usage

Run the master control panel script to orchestrate all automation:

```bash
bash scripts/master-control-panel.sh
```

Or run individual scripts in the `scripts/` folder as needed.

All outputs are generated in this directory and its subfolders.
