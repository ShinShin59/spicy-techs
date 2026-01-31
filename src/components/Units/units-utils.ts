import type { FactionLabel } from "../../store"
import unitsData from "./units.json"
import { isHeroId } from "./heroes-utils"

export interface UnitData {
  id: string
  name: string
  desc: string
  equipment: string[]
}

/** Maps store faction label to units.json key */
const factionToUnitsKey: Record<FactionLabel, keyof typeof unitsData> = {
  harkonnen: "Harkonnen",
  atreides: "Atreides",
  ecaz: "Ecaz",
  smuggler: "Smugglers",
  vernius: "Vernius",
  fremen: "Fremen",
  corrino: "Corrino",
}

/** Get units for a faction (regular units only, excludes heroes) */
export function getUnitsForFaction(faction: FactionLabel): UnitData[] {
  const key = factionToUnitsKey[faction]
  const units = (unitsData[key] as UnitData[]) || []
  return units.filter((u) => !isHeroId(u.id))
}

/** Get a unit by its ID for a specific faction */
export function getUnitById(faction: FactionLabel, unitId: string): UnitData | undefined {
  const units = getUnitsForFaction(faction)
  return units.find((u) => u.id === unitId)
}

/** Get a unit by its name for a specific faction */
export function getUnitByName(faction: FactionLabel, unitName: string): UnitData | undefined {
  const units = getUnitsForFaction(faction)
  return units.find((u) => u.name === unitName)
}
