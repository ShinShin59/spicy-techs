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
