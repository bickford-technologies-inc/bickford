import http from "node:http";

const PORT = process.env.PORT || 3000;

function request(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port: PORT,
        path,
        method: "GET"
      },
      res => {
        let data = "";
        res.on("data", d => (data += d));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

(async () => {
  console.log("🔍 Vercel Smoke Test starting…");

  // 1️⃣ Root page must load non-empty HTML
  const root = await request("/");
  if (root.status !== 200) {
    throw new Error(`Root page returned ${root.status}`);
  }
  if (!root.body || root.body.length < 200) {
    throw new Error("Root page HTML is empty or too small (white screen)");
  }
  if (!root.body.includes("Bickford")) {
    throw new Error("Root page missing expected Bickford UI marker");
  }

  // 2️⃣ API must respond (method check only)
  const api = await request("/api/converge");
  if (![200, 405].includes(api.status)) {
    throw new Error(`/api/converge unreachable (status ${api.status})`);
  }

  console.log("✅ Vercel Smoke Test PASSED");
})();
