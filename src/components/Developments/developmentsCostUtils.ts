/**
 * Helpers for development cost in the context of the tree (requires/replaces).
 * Used for "minimum path" cost: cost if you only ever research prerequisites.
 */

import developmentsData from "./developments.json"

interface DevWithRequires {
  id: string
  requires: string | null
  replaces: string | null
}

const allDevs = developmentsData as DevWithRequires[]
const idToDev = new Map<string, DevWithRequires>(allDevs.map((d) => [d.id, d]))

function getEffectiveRequires(d: DevWithRequires): string | null {
  if (d.requires) return d.requires
  if (d.replaces) {
    const replaced = idToDev.get(d.replaces)
    return replaced?.requires ?? null
  }
  return null
}

/**
 * Returns prerequisite ids for the given target in research order (roots first).
 * Does not include the target. Use for "minimum path" cost: cost to research
 * this tech if you only ever research prerequisites.
 */
export function getMinimumPathOrder(targetId: string): string[] {
  const dev = idToDev.get(targetId)
  if (!dev) return []

  const chain: string[] = []
  let current: DevWithRequires | null = dev
  while (current) {
    const reqId = getEffectiveRequires(current)
    if (!reqId) break
    chain.push(reqId)
    current = idToDev.get(reqId) ?? null
  }
  return chain.reverse()
}

/** Simple ordinal helper: 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th", etc. */
function formatOrdinal(n: number): string {
  const v = n % 100
  if (v >= 11 && v <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}

export function getLandstraadWindowPhrase(totalDays: number | undefined): string | null {
  if (totalDays == null || !Number.isFinite(totalDays)) return null
  const days = Math.max(0, Math.round(totalDays))

  // Landsraad cycle: every 20 days. We snap to the nearest multiple of 20.
  // Example phrases:
  // - "3 days before 2nd landstraad"  (e.g. 37 days → nearest is 40)
  // - "9 days after 1st landstraad"   (e.g. 29 days → nearest is 20)
  //
  // We only care when we're within ±10 days around the nearest session.
  const CYCLE = 20
  const approxIndex = Math.max(1, Math.round(days / CYCLE))
  const sessionDay = approxIndex * CYCLE
  const diff = days - sessionDay
  const absDiff = Math.abs(diff)

  const ordinal = formatOrdinal(approxIndex)
  if (diff === 0) {
    return `exactly on ${ordinal} landstraad`
  }

  const dayWord = absDiff === 1 ? "day" : "days"
  if (diff < 0) {
    return `${absDiff} ${dayWord} before ${ordinal} landstraad`
  }
  return `${absDiff} ${dayWord} after ${ordinal} landstraad`
}
