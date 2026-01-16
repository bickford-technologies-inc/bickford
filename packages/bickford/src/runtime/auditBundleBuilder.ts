import fs from "fs"
import path from "path"
import archiver from "archiver"
import { buildSLOEvidence } from "./sloEvidenceBuilder"
import { extractLedger } from "./ledgerExtract"
import { renderPDF } from "./renderPDF"
import { writeHashes } from "./bundleHash"

export async function buildBundle(
  tenantId: string,
  period: { from: string; to: string }
) {
  const dir = `tmp/audit/${tenantId}-${period.from}-${period.to}`
  fs.mkdirSync(dir, { recursive: true })

  const evidence = buildSLOEvidence(tenantId, period)
  fs.writeFileSync(
    `${dir}/slo-evidence.json`,
    JSON.stringify(evidence, null, 2)
  )

  const ledger = extractLedger(tenantId, period)
  fs.writeFileSync(
    `${dir}/ledger-extract.json`,
    JSON.stringify(ledger, null, 2)
  )

  const attestation = `
SOC-2 / FedRAMP SLO Evidence Bundle

Tenant: ${tenantId}
Period: ${period.from} → ${period.to}

This bundle was generated automatically.
Evidence hash: ${evidence.hash}
`
  fs.writeFileSync(`${dir}/slo-attestation.txt`, attestation)

  renderPDF(
    "SLO Compliance Attestation",
    attestation,
    `${dir}/attestation.pdf`
  )

  const files = fs.readdirSync(dir).map(f => `${dir}/${f}`)
  writeHashes(files, `${dir}/hashes.sha256`)

  const zipPath = `${dir}.zip`
  const output = fs.createWriteStream(zipPath)
  const archive = archiver("zip", { zlib: { level: 9 } })

  archive.pipe(output)
  for (const f of fs.readdirSync(dir)) {
    archive.file(`${dir}/${f}`, { name: f })
  }
  await archive.finalize()

  return zipPath
}
