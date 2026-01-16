import crypto from "crypto"
import fs from "fs"

export function writeHashes(files: string[], out: string) {
  const lines = files.map(f => {
    const h = crypto
      .createHash("sha256")
      .update(fs.readFileSync(f))
      .digest("hex")
    return `${h}  ${f}`
  })
  fs.writeFileSync(out, lines.join("\n"))
}
