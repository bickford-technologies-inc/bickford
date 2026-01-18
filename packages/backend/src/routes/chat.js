import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message required" });
  }

  return res.json({
    reply: `Bickford received: "${message}"`,
    ts: Date.now(),
  });
});

export default router;
