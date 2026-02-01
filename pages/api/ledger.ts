import type { NextApiRequest, NextApiResponse } from "next";
import type { Readable } from "stream";

const LEDGER_PATH = process.cwd() + "/execution-ledger.jsonl";
const S3_BUCKET = process.env.DATA_LAKE_S3_BUCKET;
const S3_KEY = process.env.DATA_LAKE_S3_KEY || "execution-ledger.jsonl";
const S3_REGION = process.env.DATA_LAKE_S3_REGION || "us-east-1";

async function readLedgerFromS3(): Promise<string> {
  throw new Error("S3 support not configured. Install @aws-sdk/client-s3 to enable S3 ledger storage.");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    let data: string;
    if (process.env.NODE_ENV === "production" && S3_BUCKET) {
      data = await readLedgerFromS3();
    } else {
      const file = Bun.file(LEDGER_PATH);
      data = await file.text();
    }

    const entries = data
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    res.status(200).json({ entries });
  } catch (err) {
    const error = err as Error;
    console.error("Failed to read ledger:", error);
    res.status(500).json({
      error: "Failed to read ledger.",
      details: error.message,
    });
  }
}
