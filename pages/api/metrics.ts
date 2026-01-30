import type { NextApiRequest, NextApiResponse } from "next";
import { authority } from "../../lib/api/authority";

type ErrorResponse = {
  error: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReturnType<typeof authority.getMetrics> | ErrorResponse>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  return res.status(200).json(authority.getMetrics());
}
