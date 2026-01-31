import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import type { Readable } from "stream";

const LEDGER_PATH = process.cwd() + "/execution-ledger.jsonl";
const S3_BUCKET = process.env.DATA_LAKE_S3_BUCKET;
const S3_KEY = process.env.DATA_LAKE_S3_KEY || "execution-ledger.jsonl";
const S3_REGION = process.env.DATA_LAKE_S3_REGION || "us-east-1";

async function readLedgerFromS3(): Promise<string> {
  const s3 = new S3Client({ region: S3_REGION });
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: S3_KEY });
  const response = await s3.send(command);

  const stream = response.Body as Readable;
  if (!stream) throw new Error("No data in S3 object");

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
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
