import { useCanon } from '../state/canonStore'
import { getPayloadString } from '../types'

function labelFromId(id: string) {
  return id
    .split(/[-_/]+/g)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ')
}

function topicFromFolderPath(p?: string) {
  const path = String(p || '').trim()
  if (!path) return null
  const parts = path.split('/').filter(Boolean)
  if (parts.length === 0) return null
  if (parts[0] === 'derek' || parts[0] === 'knowledge') {
    return parts[1] || null
  }
  return parts[parts.length - 1] || null
}

export function BranchGrid() {
  const { events } = useCanon()
  const topics = Array.from(
    new Set(
      events
        .filter((e) => e.kind === 'FOLDER_CREATED' || e.kind === 'ACTION')
        .map((e) => {
          if (e.kind === 'FOLDER_CREATED') return topicFromFolderPath(getPayloadString(e.payload, 'path'))
          const t = getPayloadString(e.payload, 'type')
          if (t !== 'BICKFORD_KNOWLEDGE_FILED') return null
          return topicFromFolderPath(getPayloadString(e.payload, 'folderPath'))
        })
        .filter((x): x is string => Boolean(x)),
    ),
  )
    .slice(0, 12)

  return (
    <div className="branchGrid">
      {topics.length === 0 ? <div className="branch">No branches yet.</div> : null}
      {topics.map((id) => (
        <div key={id} className="branch">
          {labelFromId(id)}
        </div>
      ))}
    </div>
  )
}
