export function getStableSessionId(view: string) {
  const key = `bickford.sessionId.${view}`
  try {
    const existing = window.localStorage.getItem(key)
    if (existing && existing.trim()) return existing
    const created = `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`
    window.localStorage.setItem(key, created)
    return created
  } catch {
    return `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`
  }
}
