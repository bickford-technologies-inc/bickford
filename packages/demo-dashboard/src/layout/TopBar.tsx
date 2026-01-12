import { KnowledgeTile } from '../components/KnowledgeTile'
import { ModeSelector } from '../components/ModeSelector'
import { useCanon } from '../state/canonStore'

export function TopBar() {
  const { status } = useCanon()

  return (
    <header className="topbar">
      <div className="logo">bickford</div>
      <div className="topbarRight">
        <KnowledgeTile />
        <ModeSelector />
        <div className={`status ${status}`}>{status}</div>
      </div>
    </header>
  )
}
