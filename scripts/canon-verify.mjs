#!/usr/bin/env node
import crypto from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

function sha256Hex(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
}

function verifyPair(label, canonPath, metaPath) {
  if (!existsSync(canonPath)) throw new Error(`[canon:verify] missing ${label} canon: ${canonPath}`)
  if (!existsSync(metaPath)) throw new Error(`[canon:verify] missing ${label} meta: ${metaPath}`)

  const canon = readFileSync(canonPath, 'utf8')
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
  const hash = sha256Hex(canon)

  if (!meta?.hash) throw new Error(`[canon:verify] missing hash in ${label} meta: ${metaPath}`)
  if (hash !== meta.hash) {
    throw new Error(`[canon:verify] HASH_MISMATCH ${label}: expected=${meta.hash} got=${hash}`)
  }

  return { hash }
}

function main() {
  const root = path.resolve(process.cwd())

  const srcCanon = path.join(root, 'packages', 'bickford', 'canon', 'CANON.md')
  const srcMeta = path.join(root, 'packages', 'bickford', 'canon', 'CANON.meta.json')
  const src = verifyPair('source', srcCanon, srcMeta)

  const targets = [
    { name: 'web-ui', publicDir: path.join(root, 'packages', 'web-ui', 'public') },
    { name: 'demo-dashboard', publicDir: path.join(root, 'packages', 'demo-dashboard', 'public') },
    { name: 'bickford-mobile-ui', publicDir: path.join(root, 'packages', 'bickford-mobile-ui', 'public') },
  ]

  for (const t of targets) {
    const canonPath = path.join(t.publicDir, 'canon', 'CANON.md')
    const metaPath = path.join(t.publicDir, 'canon', 'CANON.meta.json')
    const r = verifyPair(t.name, canonPath, metaPath)
    if (r.hash !== src.hash) {
      throw new Error(`[canon:verify] ${t.name} hash differs from source: src=${src.hash} target=${r.hash}`)
    }
  }

  console.log(`[canon:verify] OK sha256=${src.hash}`)
}

main()
