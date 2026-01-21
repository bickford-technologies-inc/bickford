import crypto from "crypto";
import fs from "fs";

const css = fs.readFileSync("app/chat/chat.module.css", "utf8");

const hash = crypto.createHash("sha256").update(css).digest("hex");

console.log("DESIGN_HASH:", hash);
