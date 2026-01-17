#!/usr/bin/env bash
set -euo pipefail

echo "🔒 Canonical batch fix starting…"

#############################################
# 1️⃣ ENFORCE PNPM-ONLY TOOLCHAIN (ROOT)
#############################################

echo "🧹 Rewriting root package.json (pnpm-only execution)"

node <<'EOF'
const fs = require("fs");

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

function rewrite(cmd) {
  if (!cmd) return cmd;
  return cmd
    .replace(/\bnpm run\b/g, "pnpm run")
    .replace(/\bnpm -w\b/g, "pnpm -w")
    .replace(/\bnpm --workspaces\b/g, "pnpm --workspaces")
    .replace(/\bnpm ci\b/g, "pnpm install --frozen-lockfile")
    .replace(/\bnpm install\b/g, "pnpm install");
}

for (const k of Object.keys(pkg.scripts || {})) {
  pkg.scripts[k] = rewrite(pkg.scripts[k]);
}

/* HARD NEUTER postinstall */
pkg.scripts.postinstall =
  "node -e \"if(process.env.CI||process.env.VERCEL){console.log('postinstall: skipped')}\"";

fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
EOF

#############################################
# 2️⃣ CANON GUARD: BLOCK NPM ABSOLUTELY
#############################################

echo "🛡️ Enforcing no-npm guard"

mkdir -p ci/guards

cat > ci/guards/no-npm.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

if command -v npm >/dev/null; then
  echo "❌ npm detected — pnpm-only toolchain enforced"
  exit 1
fi
EOF

chmod +x ci/guards/no-npm.sh

#############################################
# 3️⃣ WIRE GUARDS SYMMETRICALLY
#############################################

echo "🔗 Wiring guards into preinstall/prebuild"

node <<'EOF'
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

pkg.scripts.preinstall =
  "bash ./ci/guards/TOOLCHAIN_GUARD.sh && bash ./ci/guards/no-npm.sh";

pkg.scripts.prebuild =
  "bash ./ci/guards/no-npm.sh";

fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
EOF

#############################################
# 4️⃣ CANON EXPORT HARDENING
#############################################

echo "🧱 Removing wildcard canon exports"

CANON_DIR="packages/canon/src"

if [ -d "$CANON_DIR" ]; then
  grep -R "export \*" -l "$CANON_DIR" | while read -r file; do
    echo "  → stripping export * from $file"
    sed -i.bak '/export \*/d' "$file"
    rm "$file.bak"
  done
fi

#############################################
# 5️⃣ LOCKFILE REALIGNMENT (PURE PNPM)
#############################################

echo "📦 Regenerating pnpm-lock.yaml under pure pnpm"

rm -f pnpm-lock.yaml
pnpm install --no-frozen-lockfile
pnpm install --frozen-lockfile

#############################################
# 6️⃣ FINAL BUILD VERIFICATION
#############################################

echo "🧪 Running full build"
pnpm -w exec turbo run build

#############################################
# 7️⃣ COMMIT (ATOMIC)
#############################################

echo "📌 Committing canonical batch fix"

git add package.json pnpm-lock.yaml ci/guards packages/canon
git commit -m "canon(build): enforce pnpm-only execution, harden canon exports, guarantee frozen install"

echo "✅ Canonical batch fix complete."
