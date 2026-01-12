import { useUi } from '../state/uiStore'
import { useCanon } from '../state/canonStore'

export function CanonBar() {
  const { events } = useCanon()
  const { toggleLog } = useUi()

  const chips = events.slice(0, 5).slice().reverse()

  return (
    <div className="canonBar">
      <div className="canonChips">
        {chips.map((e) => (
          <span key={e.id} className="canonChip">
            {e.kind}
          </span>
        ))}
      </div>
      <button type="button" className="canonLink" onClick={toggleLog}>
        view log
      </button>
    </div>
  )
}
