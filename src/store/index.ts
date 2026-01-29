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
    { name: "spicy-techs-main-store" }
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
  for (const row of mainBaseState) {
    for (const group of row) {
      for (const cell of group) {
        if (cell !== null) {
          usedIds.push(cell)
        }
      }
    }
  }
  return usedIds
}

