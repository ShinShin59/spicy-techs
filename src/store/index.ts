import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { MainBaseLayout, MainBaseState } from "./main-base"
import { mainBasesLayout, mainBasesState } from "./main-base"

export const FACTION_LABELS = ["harkonnen", "atreides", "ecaz", "smuggler", "vernius", "fremen", "corrino"];
export type FactionLabel = "harkonnen" | "atreides" | "ecaz" | "smuggler" | "vernius" | "fremen" | "corrino";

interface MainStore {
  selectedFaction: FactionLabel
  setSelectedFaction: (faction: FactionLabel) => void
  mainBaseState: Record<FactionLabel, MainBaseState>
  setMainBaseCell: (rowIndex: number, groupIndex: number, cellIndex: number, buildingId: string | null) => void
}

export const useMainStore = create<MainStore>()(
  persist(
    (set, get) => ({
      selectedFaction: "atreides",
      setSelectedFaction: (faction) => set({ selectedFaction: faction }),
      mainBaseState: mainBasesState,
      setMainBaseCell: (rowIndex, groupIndex, cellIndex, buildingId) => {
        const { selectedFaction, mainBaseState } = get()
        const factionState = mainBaseState[selectedFaction]
        const row = factionState[rowIndex]
        const group = row[groupIndex]
        const newGroup = [...group]
        newGroup[cellIndex] = buildingId
        const newRow = row.map((g, i) => (i === groupIndex ? newGroup : g))
        const newFactionState = factionState.map((r, i) => (i === rowIndex ? newRow : r))
        set({
          mainBaseState: {
            ...mainBaseState,
            [selectedFaction]: newFactionState,
          },
        })
      },
    }),
    {
      name: "spicy-techs-main-store",
      version: 1,
      migrate: (persistedState, version) => {
        // Migration depuis l'ancienne version ou données corrompues
        if (version === 0 || !persistedState) {
          return { selectedFaction: "atreides", mainBaseState: mainBasesState }
        }
        const state = persistedState as MainStore
        // Vérifie que mainBaseState est au bon format
        if (!state.mainBaseState || typeof state.mainBaseState !== "object") {
          return { ...state, mainBaseState: mainBasesState }
        }
        // Vérifie chaque faction
        for (const faction of FACTION_LABELS) {
          const factionState = state.mainBaseState[faction as FactionLabel]
          if (!Array.isArray(factionState)) {
            return { ...state, mainBaseState: mainBasesState }
          }
        }
        return state
      },
    }
  )
)

export function useCurrentMainBaseLayout(): MainBaseLayout {
  const selectedFaction = useMainStore((state) => state.selectedFaction)
  return mainBasesLayout[selectedFaction]
}

export function useCurrentMainBaseState(): MainBaseState {
  const selectedFaction = useMainStore((state) => state.selectedFaction)
  const mainBaseState = useMainStore((state) => state.mainBaseState)
  return mainBaseState[selectedFaction]
}

/** Retourne la liste des IDs de bâtiments utilisés dans la base actuelle */
export function useUsedBuildingIds(): string[] {
  const mainBaseState = useCurrentMainBaseState()
  const usedIds: string[] = []

  // Vérification défensive : mainBaseState doit être un tableau
  if (!Array.isArray(mainBaseState)) {
    return usedIds
  }

  for (const row of mainBaseState) {
    if (!Array.isArray(row)) continue
    for (const group of row) {
      if (!Array.isArray(group)) continue
      for (const cell of group) {
        if (cell !== null) {
          usedIds.push(cell)
        }
      }
    }
  }
  return usedIds
}

