/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import type { ViewMode } from '../types'

type ModeStore = {
  mode: ViewMode
  setMode: (m: ViewMode) => void
}

const ModeContext = React.createContext<ModeStore | null>(null)

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ViewMode>('DEREK')
  const value = React.useMemo(() => ({ mode, setMode }), [mode])
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}

export function useMode() {
  const ctx = React.useContext(ModeContext)
  if (!ctx) throw new Error('useMode must be used within ModeProvider')
  return ctx
}
