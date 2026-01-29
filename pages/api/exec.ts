import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { file, args = [] } = req.body || {};
  if (!file || typeof file !== "string") {
    return res.status(400).json({ error: "Missing file to execute" });
  }
  // Only allow scripts in scripts/ or root, and only .sh, .js, .ts
  if (!/^((scripts\/)?[a-zA-Z0-9_.-]+\.(sh|js|ts))$/.test(file)) {
    return res.status(400).json({ error: "Invalid or unauthorized file" });
  }
  const cmd = file.endsWith(".sh")
    ? `bash ${file} ${args.join(" ")}`
    : file.endsWith(".js")
      ? `node ${file} ${args.join(" ")}`
      : file.endsWith(".ts")
        ? `tsx ${file} ${args.join(" ")}`
        : "";
  if (!cmd) return res.status(400).json({ error: "Unsupported file type" });
  exec(cmd, { cwd: process.cwd(), timeout: 30000 }, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: err.message, stdout, stderr });
    }
    res.status(200).json({ stdout, stderr });
  });
}
