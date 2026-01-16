const buckets: Record<string, number[]> = {}

export function allowAlert(
  tenantId: string,
  limitPerMinute: number
) {
  const now = Date.now()
  buckets[tenantId] ||= []
  buckets[tenantId] = buckets[tenantId].filter(t => now - t < 60_000)

  if (buckets[tenantId].length >= limitPerMinute) return false

  buckets[tenantId].push(now)
  return true
}
