import crypto from "crypto";

export function sign(root: string, privateKey: string) {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(root);
  return signer.sign(privateKey, "base64");
}
