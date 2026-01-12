# SAM.gov Integration (Public API)

**TIMESTAMP**: 2025-12-31T00:00:00-05:00

This repo includes minimal scripts to query SAM.gov opportunities using a SAM.gov **Public API Key**.

## Security
- Do **not** commit your API key.
- Use an environment variable:
  - `export SAMGOV_API_KEY=...`

Recommended (more stable in automated shells):
- Store the key in a local ignored file and point to it:
  - `mkdir -p .secrets && printf "%s" "<YOUR_KEY>" > .secrets/samgov.key`
  - `export SAMGOV_API_KEY_PATH=.secrets/samgov.key`

## Commands

### Search opportunities
Prints raw JSON from the opportunities search endpoint.

- `npm run sam:search -- --q "execution governance" --limit 5`

Notes:
- SAM.gov requires `postedFrom` and `postedTo`. The script defaults to the last 30 days.
- You can override explicitly:
  - `npm run sam:search -- --q "execution governance" --postedFrom 2025-12-01 --postedTo 2025-12-31 --limit 5`

Date format note:
- The SAM.gov API expects `MM/dd/yyyy`, but these scripts accept either `YYYY-MM-DD` or `MM/dd/yyyy` and will normalize automatically.

Optional:
- `--offset 0`
- `--baseUrl https://api.sam.gov/prod`

### Fetch a notice (by noticeId)
Writes JSON to a file for inclusion in `bid_out/`.

- `npm run sam:fetch:notice -- --noticeId <ID> --out bid_out/samgov/notice.json`

Optional:
- `--baseUrl https://api.sam.gov/prod`

## Notes
SAM.gov API shapes/endpoints evolve. If the endpoint path changes, keep the workflow the same and adjust the script’s path (or provide a different `--baseUrl`).
