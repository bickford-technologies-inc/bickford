import express from "express";
import cors from "cors";
import chat from "./routes/chat.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chat);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend listening on ${PORT}`);
});
