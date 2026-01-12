#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function exists(filePath) {
  try {
    fs.accessSync(filePath)
    return true
  } catch {
    return false
  }
}

function fail(message) {
  console.error(`railway-doctor: ${message}`)
  process.exitCode = 1
}

function ok(message) {
  console.log(`railway-doctor: ${message}`)
}

function warn(message) {
  console.warn(`railway-doctor: WARN: ${message}`)
}

function findConflictMarkers(dir) {
  const results = []
  const stack = [dir]
  const excludeRel = new Set([
    path.normalize('scripts/railway-doctor.mjs'),
    path.normalize('.github/workflows/no-conflict-markers.yml'),
  ])

  while (stack.length) {
    const current = stack.pop()
    if (!current) break

    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === '.git' || entry.name === 'node_modules') continue
        stack.push(full)
        continue
      }

      if (!entry.isFile()) continue
      // Skip binaries / big files by extension.
      if (/(^|\.)png$|(^|\.)jpg$|(^|\.)jpeg$|(^|\.)gif$|(^|\.)mp4$|(^|\.)zip$/.test(entry.name)) continue

      const rel = path.normalize(path.relative(ROOT, full))
      if (excludeRel.has(rel)) continue

      let text
      try {
        text = readText(full)
      } catch {
        continue
      }

      if (text.includes('<<<<<<< ') || text.includes('>>>>>>> ')) {
        results.push(rel)
      }
    }
  }

  return results
}

function parseVersion(v) {
  const m = String(v).trim().match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!m) return null
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) }
}

function gte(a, b) {
  if (a.major !== b.major) return a.major > b.major
  if (a.minor !== b.minor) return a.minor > b.minor
  return a.patch >= b.patch
}

// 1) Merge conflict markers
const conflicts = findConflictMarkers(ROOT)
if (conflicts.length) {
  fail(`merge conflict markers detected in:\n- ${conflicts.join('\n- ')}`)
} else {
  ok('no merge conflict markers found')
}

// 2) Node version pin
// Prisma (and some tooling) currently requires: ^20.19 || ^22.12 || >=24.0
const required20 = parseVersion('20.19.0')
const required22 = parseVersion('22.12.0')

function isSupportedNode(v) {
  if (!v) return false
  if (v.major == 20) return gte(v, required20)
  if (v.major == 22) return gte(v, required22)
  if (v.major >= 24) return true
  return false
}

const pins = ['.node-version', '.nvmrc'].filter((f) => exists(path.join(ROOT, f)))
if (!pins.length) {
  fail('missing .node-version/.nvmrc; Railway/Vite builds will drift')
} else {
  for (const f of pins) {
    const v = parseVersion(readText(path.join(ROOT, f)))
    if (!v) {
      fail(`${f} is not a semver version (expected like 20.19.4 or 22.12.0)`)
      continue
    }

    if (!isSupportedNode(v)) {
      fail(
        `${f} is ${v.major}.${v.minor}.${v.patch} but build tooling requires ^20.19 || ^22.12 || >=24.0`
      )
    } else {
      ok(`${f} ok (${v.major}.${v.minor}.${v.patch})`)
    }
  }
}

// 3) Config-as-code presence
const configFiles = ['railway.toml', 'railway.json', 'nixpacks.toml']
const presentConfigs = configFiles.filter((f) => exists(path.join(ROOT, f)))

if (!presentConfigs.includes('railway.toml') && !presentConfigs.includes('railway.json')) {
  fail('missing railway.toml/railway.json at repo root (Railway config-as-code expects one of these)')
} else {
  for (const f of presentConfigs) ok(`${f} present`)
  if (presentConfigs.includes('railway.toml') && presentConfigs.includes('railway.json')) {
    warn('both railway.toml and railway.json exist; keep them in sync or delete one to avoid confusing deployments')
  }
}

// 4) Build command should NOT run npm ci twice
function includesDoubleInstall(cmd) {
  return /\bnpm\s+ci\b/.test(cmd)
}

function readRailwayTomlBuildCommand(tomlText) {
  const m = tomlText.match(/^buildCommand\s*=\s*"([^"]+)"/m)
  return m ? m[1] : null
}

function readRailwayJsonBuildCommand(jsonText) {
  try {
    const j = JSON.parse(jsonText)
    return j?.build?.buildCommand ?? null
  } catch {
    return null
  }
}

const buildCommands = []
if (exists(path.join(ROOT, 'railway.toml'))) {
  const cmd = readRailwayTomlBuildCommand(readText(path.join(ROOT, 'railway.toml')))
  if (cmd) buildCommands.push({ file: 'railway.toml', cmd })
}
if (exists(path.join(ROOT, 'railway.json'))) {
  const cmd = readRailwayJsonBuildCommand(readText(path.join(ROOT, 'railway.json')))
  if (cmd) buildCommands.push({ file: 'railway.json', cmd })
}

for (const { file, cmd } of buildCommands) {
  if (includesDoubleInstall(cmd)) fail(`${file} buildCommand contains "npm ci"; Nixpacks already runs install, so this causes double install/cache issues`)
  if (!/scripts\/railway-build\.sh/.test(cmd)) warn(`${file} buildCommand does not use scripts/railway-build.sh; consider unifying to avoid drift`)
}

// 5) Prisma 7 config sanity
if (!exists(path.join(ROOT, 'prisma.config.ts'))) {
  warn('missing prisma.config.ts; Prisma 7 migrate/introspection may fail without it')
} else {
  ok('prisma.config.ts present')
}

if (exists(path.join(ROOT, 'prisma/schema.prisma'))) {
  const schema = readText(path.join(ROOT, 'prisma/schema.prisma'))
  if (/^\s*url\s*=\s*env\(/m.test(schema)) {
    fail('prisma/schema.prisma still contains datasource url=env(...); Prisma 7 requires moving URL config to prisma.config.ts')
  }
}

if (process.exitCode && process.exitCode !== 0) {
  console.error('\nrailway-doctor: FAIL')
  process.exit(process.exitCode)
}

console.log('\nrailway-doctor: OK')
console.log('\nNext steps (Railway UI):')
console.log('- web-ui service → Settings → Source → Root Directory: .')
console.log('- web-ui service → Settings → Config-as-code → File Path: railway.toml (or railway.json, but pick one)')
console.log('- web-ui service → Settings → Builder: Nixpacks (no custom build/start overrides)')
console.log('- web-ui service → Variables: DATABASE_URL (from Postgres), NIXPACKS_NODE_VERSION=20.19.4')
