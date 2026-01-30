# Data Lake Integration (Production Ledger)

This project now reads the canonical execution ledger from a real data lake (AWS S3) in production.

## Configuration

Set the following environment variables in your production deployment:

- `DATA_LAKE_S3_BUCKET` — Name of the S3 bucket containing the ledger file
- `DATA_LAKE_S3_KEY` — (Optional) Key/path to the ledger file in the bucket (default: `execution-ledger.jsonl`)
- `DATA_LAKE_S3_REGION` — (Optional) AWS region (default: `us-east-1`)
- AWS credentials: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (or use IAM role)

## Local Development

- If `DATA_LAKE_S3_BUCKET` is not set or not in production, the API will read from the local `execution-ledger.jsonl` file.

## Dependencies

- Uses `@aws-sdk/client-s3` (AWS SDK v3, Bun/Node compatible)

## Security

- Ensure S3 bucket access is tightly controlled.
- Do not commit credentials to source control.

## Example Vercel Environment Variables

```
DATA_LAKE_S3_BUCKET=my-bickford-ledger-prod
DATA_LAKE_S3_KEY=execution-ledger.jsonl
DATA_LAKE_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=... (set in Vercel dashboard)
AWS_SECRET_ACCESS_KEY=... (set in Vercel dashboard)
```

---

For questions, see `pages/api/ledger.ts` or contact the Bickford engineering team.
