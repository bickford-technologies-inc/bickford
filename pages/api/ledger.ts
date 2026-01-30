import { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";

// Import AWS SDK v3 for S3 access
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const LEDGER_PATH = path.join(process.cwd(), "execution-ledger.jsonl");

// S3 config from environment
const S3_BUCKET = process.env.DATA_LAKE_S3_BUCKET;
const S3_KEY = process.env.DATA_LAKE_S3_KEY || "execution-ledger.jsonl";
const S3_REGION = process.env.DATA_LAKE_S3_REGION || "us-east-1";

async function readLedgerFromS3() {
  const s3 = new S3Client({ region: S3_REGION });
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: S3_KEY });
  const response = await s3.send(command);
  // S3 returns a stream, convert to string
  const stream = response.Body;
  if (!stream) throw new Error("No data in S3 object");
  const chunks: Buffer[] = [];
  for await (const chunk of stream as any) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    let data: string;
    if (process.env.NODE_ENV === "production" && S3_BUCKET) {
      // Read from S3 data lake in production
      data = await readLedgerFromS3();
    } else {
      // Fallback to local file for dev/local
      data = await fs.readFile(LEDGER_PATH, "utf-8");
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
    res
      .status(500)
      .json({
        error: "Failed to read ledger.",
        details: (err as Error).message,
      });
  }
}
