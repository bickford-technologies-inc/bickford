/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'

type UiStore = {
  logOpen: boolean
  toggleLog: () => void
  closeLog: () => void
  replayAt: string | null
  setReplayAt: (iso: string | null) => void
}

const UiContext = React.createContext<UiStore | null>(null)

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [logOpen, setLogOpen] = React.useState(false)
  const [replayAt, setReplayAt] = React.useState<string | null>(null)

  const value = React.useMemo<UiStore>(
    () => ({
      logOpen,
      toggleLog: () => setLogOpen((v) => !v),
      closeLog: () => setLogOpen(false),
      replayAt,
      setReplayAt,
    }),
    [logOpen, replayAt],
  )

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi() {
  const ctx = React.useContext(UiContext)
  if (!ctx) throw new Error('useUi must be used within UiProvider')
  return ctx
}
