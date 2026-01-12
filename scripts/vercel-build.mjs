import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

function isMonorepoRoot(dir) {
  const pkgPath = path.join(dir, 'package.json')
  if (!existsSync(pkgPath)) return false
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    return Boolean(pkg && pkg.workspaces)
  } catch {
    return false
  }
}

function findMonorepoRoot(startDir) {
  let dir = startDir
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (isMonorepoRoot(dir)) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

function runNpm(args, cwd) {
  const r = spawnSync('npm', args, { stdio: 'inherit', cwd, env: process.env })
  if (typeof r.status === 'number' && r.status !== 0) process.exit(r.status)
  if (r.error) {
    console.error(r.error)
    process.exit(1)
  }
}

const target = (process.env.VERCEL_TARGET_WORKSPACE || 'demo-dashboard').trim()
const cwd = process.cwd()
const root = findMonorepoRoot(cwd)

if (!root) {
  console.error(`[vercel-build] Could not locate monorepo root from ${cwd}`)
  process.exit(1)
}

console.log(`[vercel-build] monorepo root: ${root}`)
console.log(`[vercel-build] target workspace: ${target}`)

runNpm(['-w', target, 'run', 'build'], root)
