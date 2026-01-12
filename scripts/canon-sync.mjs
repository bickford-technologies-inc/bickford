#!/usr/bin/env node
import crypto from 'node:crypto'
import { mkdirSync, readFileSync, copyFileSync, existsSync } from 'node:fs'
import path from 'node:path'

function sha256Hex(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
}

function ensureDir(p) {
  mkdirSync(p, { recursive: true })
}

function verifyPair(canonPath, metaPath) {
  const canon = readFileSync(canonPath, 'utf8')
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
  const hash = sha256Hex(canon)
  if (!meta?.hash || hash !== meta.hash) {
    throw new Error(`CANON INTEGRITY VIOLATION: ${canonPath} expected=${meta?.hash || 'missing'} got=${hash}`)
  }
}

function syncTo(targetPublicDir, srcCanonPath, srcMetaPath) {
  const outDir = path.join(targetPublicDir, 'canon')
  ensureDir(outDir)
  copyFileSync(srcCanonPath, path.join(outDir, 'CANON.md'))
  copyFileSync(srcMetaPath, path.join(outDir, 'CANON.meta.json'))
}

function main() {
  const root = path.resolve(process.cwd())
  const srcCanonPath = path.join(root, 'packages', 'bickford', 'canon', 'CANON.md')
  const srcMetaPath = path.join(root, 'packages', 'bickford', 'canon', 'CANON.meta.json')

  if (!existsSync(srcCanonPath) || !existsSync(srcMetaPath)) {
    throw new Error('Missing source canon artifacts under packages/bickford/canon/')
  }

  verifyPair(srcCanonPath, srcMetaPath)

  const targets = [
    path.join(root, 'packages', 'web-ui', 'public'),
    path.join(root, 'packages', 'demo-dashboard', 'public'),
    path.join(root, 'packages', 'bickford-mobile-ui', 'public'),
  ]

  for (const t of targets) {
    if (!existsSync(t)) continue
    syncTo(t, srcCanonPath, srcMetaPath)
    console.log(`[canon:sync] -> ${path.join(t, 'canon')}`)
  }

  console.log('[canon:sync] OK')
}

main()
