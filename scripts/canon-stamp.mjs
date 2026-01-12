#!/usr/bin/env node
import crypto from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

function argValue(flag) {
  const idx = process.argv.indexOf(flag)
  if (idx === -1) return null
  return process.argv[idx + 1] ?? null
}

function sha256Hex(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
}

function main() {
  const canonPath =
    argValue('--canon') || path.resolve(process.cwd(), 'packages', 'bickford', 'canon', 'CANON.md')
  const metaPath =
    argValue('--meta') || path.resolve(process.cwd(), 'packages', 'bickford', 'canon', 'CANON.meta.json')

  const canon = readFileSync(canonPath, 'utf8')
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'))

  const hash = sha256Hex(canon)
  const stamped = {
    ...meta,
    timestamp: new Date().toISOString(),
    hash_algo: 'sha256',
    hash,
  }

  writeFileSync(metaPath, JSON.stringify(stamped, null, 2) + '\n', 'utf8')
  console.log(`[canon:stamp] canon=${canonPath}`)
  console.log(`[canon:stamp] meta=${metaPath}`)
  console.log(`[canon:stamp] sha256=${hash}`)
}

main()
