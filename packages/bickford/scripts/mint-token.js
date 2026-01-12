// scripts/mint-token.js
// TIMESTAMP: 2025-12-23T15:45:00-05:00
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  {
    tenant_id: "t_demo",
    caller_type: "system",
    caller_id: "local-dev",
    scopes: ["canon.decide", "canon.promote", "canon.ni", "canon.read"],
  },
  process.env.JWT_SECRET,
  { issuer: process.env.JWT_ISSUER, audience: process.env.JWT_AUDIENCE, expiresIn: "1h" }
);

console.log(token);
