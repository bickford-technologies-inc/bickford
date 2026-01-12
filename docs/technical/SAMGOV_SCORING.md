# SAM.gov Scoring (0–100)

This repo includes an automated scoring and triage pipeline for SAM.gov opportunities.

## What it does

- Searches SAM.gov opportunities for a query and date window
- Scores each opportunity from 0–100 with an explicit rubric and per-criterion breakdown
- For opportunities above a threshold (default: 90), generates:
  - `email.eml` draft addressed to the notice contact (when present)
  - `SUBMISSION_CHECKLIST.md` stub checklist
  - `notice.json` (best-effort; fetched via notice endpoint when enabled)

## What it does not do

- It does not “review all SAM.gov” (unbounded). You control the query/date/limit.
- It does not automatically send email via Gmail. It generates `.eml` drafts + a `send_queue.json`.

## Scoring rubric (default)

Weights are in [bid/scoring/scoring.config.json](../../bid/scoring/scoring.config.json):

- Eligibility (30)
  - Set-aside / NAICS / PSC match (when configured)
- Technical fit (25)
  - Keyword match against opportunity text (title/description/metadata)
  - Negative keyword penalties
- Strategic value (15)
  - Placeholder heuristics (agency presence, etc.)
- Bid friction (15)
  - Deadline proximity (short deadlines score lower)
- Risk (15)
  - Penalties for missing required fields

Your capability profile is in [bid/scoring/bickford.profile.json](../../bid/scoring/bickford.profile.json).

## Usage

Online (requires `SAMGOV_API_KEY` or `SAMGOV_API_KEY_PATH`):

```bash
npm run sam:score -- --q "execution governance" --postedFrom 2025-12-01 --postedTo 2025-12-31 --limit 25 --threshold 90
```

Review “all open bids” (paged):

```bash
# Fetch up to 2000 results (50 pages × 40 per page), filter to not-yet-deadline.
npm run sam:score -- --q "execution governance" \
  --postedFrom 2025-12-01 --postedTo 2025-12-31 \
  --limit 40 --pages 50 --maxResults 2000 --acceptingBids 1 \
  --threshold 90
```

Notes:
- `--acceptingBids 1` keeps opportunities that appear to be open for responses (future deadline, or open/active status fields).
- For large paged sweeps, per-notice detail fetches can burn quota quickly. The scorer defaults `--fetchNotices` to off when `--pages > 1`. You can force it on with `--fetchNotices 1`.

Throttling / quotas:
- SAM.gov enforces rate limits and daily quotas. If you hit HTTP 429, the scorer checkpoints partial results to `out/samgov/search.json` and exits with an error that includes the server-provided `nextAccessTime` (when available).
- To resume a large sweep after quota reset, rerun with `--appendSearch 1` using the same query + date window. The script will continue from the saved `nextOffset`.

Resume example:

```bash
npm run sam:score -- --q "execution governance" \
  --postedFrom 2025-12-01 --postedTo 2025-12-31 \
  --limit 40 --pages 50 --maxResults 2000 --acceptingBids 1 \
  --threshold 90 --appendSearch 1
```

Date format note:
- The SAM.gov API expects `MM/dd/yyyy`, but this script accepts either `YYYY-MM-DD` or `MM/dd/yyyy` and will normalize automatically.

Offline (score an existing search JSON):

```bash
npm run sam:score -- --in out/samgov/search.json --threshold 90
```

Option B1 (CSV → SAM-like JSON → score with the same model):

```bash
# CSV is mapped into a notice-like object and written to out/samgov/search.json,
# then scored by the exact same pipeline.
npm run sam:score -- --csv path/to/export.csv --fetchNotices 0 --acceptingBids 1 --threshold 90 --out out/samgov
```

Canonical mapping (high-level):
- `NoticeId` → `notice.noticeId`
- `Title` → `notice.title`
- `Description` → `notice.description`
- `Sol#` → `notice.solicitationNumber`
- `Department/Ind.Agency`, `Sub-Tier`, `Office` → `notice.agency/department/office`
- `PostedDate` → `notice.postedDate`
- `ResponseDeadLine` → `notice.responseDeadLine`
- `NaicsCode` → `notice.naicsCode`
- `ClassificationCode` → `notice.pscCode` + `notice.classificationCode`
- `SetASide`/`SetASideCode` → `notice.typeOfSetAside`
- `Active`/`ArchiveType`/`ArchiveDate`/`Type` → status-ish fields used by `--acceptingBids`
- `PrimaryContactEmail`/`SecondaryContactEmail` → `notice.pointOfContactEmail`

Outputs (default):

- `out/samgov/report.json` (ranked summary)
- `out/samgov/report.csv` (spreadsheet-friendly)
- `out/samgov/opportunities/<noticeId>/...` (draft artifacts)
- `out/samgov/send_queue.json` (what to send)
