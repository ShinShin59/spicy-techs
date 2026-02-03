/**
 * Development (tech) research cost and time estimation.
 *
 * Formula from res/assets/data.cdb (constant sheet):
 *   cost = BaseCost × (ScalePerStep^TotalStepResearched) × (ScalePerStep^StepForCurrentDev - 1) / (ScalePerStep - 1)
 * Steps per tier from Development_StepsPerTier: [2, 3, 4, 5] for tier 0..3.
 *
 * See src/components/Developments/TECH_COST_INVESTIGATION.md for full investigation.
 */

/** Game constants from data.cdb (constant sheet). Sync with CDB if game balance changes. */
export const DEVELOPMENT_COST = {
  baseCost: 10,
  scalePerStep: 1.036,
  /** Steps for tier 0, 1, 2, 3 */
  stepsPerTier: [2, 3, 4, 5] as const,
} as const

/** Default Knowledge per day for time estimates. Not in CDB; used when no rate is provided. */
export const DEFAULT_KNOWLEDGE_PER_DAY = 5

/** Development entry minimal shape for cost calculation (need tier only). */
export interface DevWithTier {
  id: string
  tier: number
}

/**
 * Returns the number of "steps" for a given tier (0..3).
 * Out-of-range tier is clamped; tier 0 → 2 steps, 1 → 3, 2 → 4, 3 → 5.
 */
export function getStepsForTier(tier: number): number {
  const idx = Math.max(0, Math.min(3, Math.floor(tier)))
  return DEVELOPMENT_COST.stepsPerTier[idx]
}

/**
 * Cost in Knowledge to research one development.
 * @param stepForCurrentDev - Steps for this dev (use getStepsForTier(tier))
 * @param totalStepResearched - Sum of steps of all developments already researched (in order)
 */
export function developmentCost(
  stepForCurrentDev: number,
  totalStepResearched: number
): number {
  const { baseCost, scalePerStep } = DEVELOPMENT_COST
  const exponent = totalStepResearched
  const geometric =
    (Math.pow(scalePerStep, stepForCurrentDev) - 1) / (scalePerStep - 1)
  return baseCost * Math.pow(scalePerStep, exponent) * geometric
}

/**
 * Given an ordered list of developments (by id) and a map id → dev (with tier),
 * returns the total step count after researching all of them in that order.
 */
export function totalStepsResearched(
  orderedDevIds: string[],
  idToDev: Map<string, DevWithTier>
): number {
  let total = 0
  for (const id of orderedDevIds) {
    const dev = idToDev.get(id)
    if (dev != null) total += getStepsForTier(dev.tier)
  }
  return total
}

/**
 * Cost in Knowledge to research a specific development when researched immediately
 * after the given ordered list of already-researched development ids.
 */
export function costToResearchNext(
  dev: DevWithTier,
  alreadyResearchedIds: string[],
  idToDev: Map<string, DevWithTier>
): number {
  const totalStep = totalStepsResearched(alreadyResearchedIds, idToDev)
  const steps = getStepsForTier(dev.tier)
  return developmentCost(steps, totalStep)
}

/**
 * Total cost in Knowledge to research all developments in the given order.
 * Sums costToResearchNext for each dev at its position in the list.
 */
export function totalCostOfOrder(
  orderedIds: string[],
  idToDev: Map<string, DevWithTier>
): number {
  let total = 0
  for (let i = 0; i < orderedIds.length; i++) {
    const dev = idToDev.get(orderedIds[i])
    if (dev == null) continue
    const alreadyResearched = orderedIds.slice(0, i)
    total += costToResearchNext(dev, alreadyResearched, idToDev)
  }
  return total
}

/**
 * Estimated time in days to complete research, assuming a constant Knowledge per day rate.
 * Uses DEFAULT_KNOWLEDGE_PER_DAY (5) when no rate is passed. In-game rate varies; use for UI only.
 */
export function costToDays(
  costKnowledge: number,
  knowledgePerDay: number = DEFAULT_KNOWLEDGE_PER_DAY
): number {
  if (knowledgePerDay <= 0) return Infinity
  return costKnowledge / knowledgePerDay
}

/** In-game month length in days */
export const DAYS_PER_MONTH = 30

/**
 * Formats a number of days as "X month(s) Y day(s)". Uses DAYS_PER_MONTH (30) for months.
 * Omits months when 0; omits days when 0. Singular "month"/"day" when 1.
 */
export function formatDaysAsMonthsAndDays(totalDays: number): string {
  const months = Math.floor(totalDays / DAYS_PER_MONTH)
  const days = totalDays % DAYS_PER_MONTH
  if (months === 0) return `${days} ${days === 1 ? "day" : "days"}`
  if (days === 0) return `${months} ${months === 1 ? "month" : "months"}`
  return `${months} ${months === 1 ? "month" : "months"} ${days} ${days === 1 ? "day" : "days"}`
}

/**
 * Short form for tight UI (e.g. tooltip on icon): "1m 23d".
 */
export function formatDaysAsMonthsAndDaysShort(totalDays: number): string {
  const months = Math.floor(totalDays / DAYS_PER_MONTH)
  const days = totalDays % DAYS_PER_MONTH
  if (months === 0) return `${days}d`
  if (days === 0) return `${months}m`
  return `${months}m ${days}d`
}
