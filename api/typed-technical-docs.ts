import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const docsDir = `${process.cwd()}/docs/technical`;
    const glob = new Bun.Glob("*.md");
    const docs: Record<string, string> = {};
    
    for await (const file of glob.scan({ cwd: docsDir })) {
      const filePath = `${docsDir}/${file}`;
      const bunFile = Bun.file(filePath);
      const content = await bunFile.text();
      docs[file] = content;
    }
    
    res.status(200).json({ docs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
}
