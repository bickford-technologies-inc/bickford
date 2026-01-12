import { useMode } from '../state/modeStore'
import type { ViewMode } from '../types'

const MODES: ViewMode[] = ['DEREK', 'DEMO', 'BUILD']

export function ModeSelector() {
  const { mode, setMode } = useMode()

  return (
    <label className="modeSelector">
      <span className="modeLabel">Mode</span>
      <select value={mode} onChange={(e) => setMode(e.target.value as ViewMode)}>
        {MODES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </label>
  )
}
