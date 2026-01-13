// notary.s3.ts
// TIMESTAMP: 2025-12-23T14:55:00-05:00
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const bucket = process.env.NOTARY_S3_BUCKET!;
const prefix = process.env.NOTARY_S3_PREFIX || "anchors";
const hmacSecret = process.env.NOTARY_HMAC_SECRET || "";

export type AnchorPayload = {
  pointer: string;
  headSeq: number;
  headHash: string;
  ts: string;
  canonVersion: string;
  prevAnchorHash?: string | null;
};

function hmacSign(payloadJson: string) {
  if (!hmacSecret) return null;
  return crypto.createHmac("sha256", hmacSecret).update(payloadJson).digest("hex");
}

export async function writeS3Anchor(payload: AnchorPayload) {
  const s3 = new S3Client({});
  const key = `${prefix}/${payload.pointer.replace(/[^a-zA-Z0-9._-]/g, "_")}/${payload.headSeq}_${payload.headHash}.json`;

  const body = JSON.stringify(payload);
  const sig = hmacSign(body);

  const finalBody = JSON.stringify({
    ...payload,
    signing: sig ? { method: "HMAC", sig } : { method: "none" },
  });

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: finalBody,
    ContentType: "application/json",
  });

  const resp = await s3.send(cmd);

  return {
    anchorType: "s3",
    anchorUri: `s3://${bucket}/${key}`,
    etag: resp.ETag ?? null,
    versionId: (resp as any).VersionId ?? null,
    signature: sig,
    payload: JSON.parse(finalBody),
  };
}
