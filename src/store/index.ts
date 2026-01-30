import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SharedBuildPayload } from "../utils/mainBaseShare"
import type { MainBaseLayout, MainBaseState } from "./main-base"
import { mainBasesLayout, mainBasesState } from "./main-base"

export const FACTION_LABELS = ["harkonnen", "atreides", "ecaz", "smuggler", "vernius", "fremen", "corrino"];
export type FactionLabel = "harkonnen" | "atreides" | "ecaz" | "smuggler" | "vernius" | "fremen" | "corrino";

/** Coordonnées d'une cellule de bâtiment */
export interface BuildingCoords {
  rowIndex: number
  groupIndex: number
  cellIndex: number
}

/** Ordre des bâtiments par faction */
export type BuildingOrderState = Record<FactionLabel, BuildingCoords[]>

/** État initial de l'ordre des bâtiments (vide pour chaque faction) */
const initialBuildingOrder: BuildingOrderState = {
  harkonnen: [],
  atreides: [],
  ecaz: [],
  smuggler: [],
  vernius: [],
  fremen: [],
  corrino: [],
}

/** Build sauvegardé (liste locale, id non partagé en URL) */
export interface SavedBuild {
  id: string
  name: string
  createdAt: number
  selectedFaction: FactionLabel
  mainBaseState: Record<FactionLabel, MainBaseState>
  buildingOrder: BuildingOrderState
}

function generateBuildId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/** Snapshot pour comparer l'état courant à la dernière sauvegarde (null = jamais sauvegardé) */
export type BuildSnapshot = string | null

interface MainStore {
  selectedFaction: FactionLabel
  setSelectedFaction: (faction: FactionLabel) => void
  mainBaseState: Record<FactionLabel, MainBaseState>
  buildingOrder: BuildingOrderState
  currentBuildName: string
  savedBuilds: SavedBuild[]
  lastSavedSnapshot: BuildSnapshot
  setMainBaseCell: (rowIndex: number, groupIndex: number, cellIndex: number, buildingId: string | null) => void
  loadSharedBuild: (payload: SharedBuildPayload) => void
  setCurrentBuildName: (name: string) => void
  saveCurrentBuild: (name?: string) => void
  loadBuild: (id: string) => void
  deleteBuild: (id: string) => void
  renameBuild: (id: string, name: string) => void
  resetToDefault: () => void
}

export function getBuildSnapshot(state: {
  selectedFaction: FactionLabel
  mainBaseState: Record<FactionLabel, MainBaseState>
  buildingOrder: BuildingOrderState
  currentBuildName: string
}): string {
  return JSON.stringify({
    selectedFaction: state.selectedFaction,
    mainBaseState: state.mainBaseState,
    buildingOrder: state.buildingOrder,
    currentBuildName: state.currentBuildName,
  })
}

const DEFAULT_BUILD_NAME = "My build"

export const useMainStore = create<MainStore>()(
  persist(
    (set, get) => ({
      selectedFaction: "atreides",
      setSelectedFaction: (faction) => set({ selectedFaction: faction }),
      mainBaseState: mainBasesState,
      buildingOrder: initialBuildingOrder,
      currentBuildName: DEFAULT_BUILD_NAME,
      savedBuilds: [],
      lastSavedSnapshot: null,
      setMainBaseCell: (rowIndex, groupIndex, cellIndex, buildingId) => {
        const { selectedFaction, mainBaseState, buildingOrder } = get()
        const factionState = mainBaseState[selectedFaction]
        const row = factionState[rowIndex]
        const group = row[groupIndex]
        const newGroup = [...group]
        newGroup[cellIndex] = buildingId
        const newRow = row.map((g, i) => (i === groupIndex ? newGroup : g))
        const newFactionState = factionState.map((r, i) => (i === rowIndex ? newRow : r))

        // Gestion de l'ordre des bâtiments
        const factionOrder = buildingOrder[selectedFaction]
        // Retirer l'ancienne entrée pour cette cellule (si elle existe)
        const filteredOrder = factionOrder.filter(
          (coord) => !(coord.rowIndex === rowIndex && coord.groupIndex === groupIndex && coord.cellIndex === cellIndex)
        )
        // Si on ajoute un bâtiment, l'ajouter à la fin de l'ordre
        const newFactionOrder = buildingId !== null
          ? [...filteredOrder, { rowIndex, groupIndex, cellIndex }]
          : filteredOrder

        set({
          mainBaseState: {
            ...mainBaseState,
            [selectedFaction]: newFactionState,
          },
          buildingOrder: {
            ...buildingOrder,
            [selectedFaction]: newFactionOrder,
          },
        })
      },
      loadSharedBuild: (payload) => {
        const { mainBaseState, buildingOrder } = get()
        set({
          selectedFaction: payload.f,
          mainBaseState: { ...mainBaseState, [payload.f]: payload.state },
          buildingOrder: { ...buildingOrder, [payload.f]: payload.order },
        })
      },
      setCurrentBuildName: (name) => set({ currentBuildName: name.trim() || DEFAULT_BUILD_NAME }),
      saveCurrentBuild: (name) => {
        const { selectedFaction, mainBaseState, buildingOrder, savedBuilds, currentBuildName } = get()
        const factionNumRegex = new RegExp(`^${selectedFaction}\\s+(\\d+)$`)
        const existingNums = savedBuilds
          .map((b) => b.name.match(factionNumRegex)?.[1])
          .filter(Boolean)
          .map((s) => parseInt(s!, 10))
        const nextNum = existingNums.length === 0 ? 1 : Math.max(...existingNums) + 1
        const defaultName = `${selectedFaction} ${nextNum}`
        const finalName = (name?.trim() || defaultName).trim() || defaultName
        const saved: SavedBuild = {
          id: generateBuildId(),
          name: finalName,
          createdAt: Date.now(),
          selectedFaction,
          mainBaseState: JSON.parse(JSON.stringify(mainBaseState)),
          buildingOrder: JSON.parse(JSON.stringify(buildingOrder)),
        }
        const snapshot = getBuildSnapshot({ selectedFaction, mainBaseState, buildingOrder, currentBuildName })
        set({ savedBuilds: [saved, ...savedBuilds], lastSavedSnapshot: snapshot })
      },
      loadBuild: (id) => {
        const { savedBuilds } = get()
        const build = savedBuilds.find((b) => b.id === id)
        if (!build) return
        set({
          selectedFaction: build.selectedFaction,
          mainBaseState: JSON.parse(JSON.stringify(build.mainBaseState)),
          buildingOrder: JSON.parse(JSON.stringify(build.buildingOrder)),
          currentBuildName: build.name,
        })
      },
      deleteBuild: (id) => {
        const { savedBuilds } = get()
        const build = savedBuilds.find((b) => b.id === id)
        if (!build) return
        const current = get()
        const currentSnapshot = getBuildSnapshot({
          selectedFaction: current.selectedFaction,
          mainBaseState: current.mainBaseState,
          buildingOrder: current.buildingOrder,
          currentBuildName: current.currentBuildName,
        })
        const buildSnapshot = getBuildSnapshot({
          selectedFaction: build.selectedFaction,
          mainBaseState: build.mainBaseState,
          buildingOrder: build.buildingOrder,
          currentBuildName: build.name,
        })
        if (currentSnapshot === buildSnapshot) {
          set({
            selectedFaction: "atreides",
            mainBaseState: mainBasesState,
            buildingOrder: initialBuildingOrder,
            currentBuildName: DEFAULT_BUILD_NAME,
            lastSavedSnapshot: null,
            savedBuilds: savedBuilds.filter((b) => b.id !== id),
          })
        } else {
          set({ savedBuilds: savedBuilds.filter((b) => b.id !== id) })
        }
      },
      resetToDefault: () => {
        set({
          selectedFaction: "atreides",
          mainBaseState: mainBasesState,
          buildingOrder: initialBuildingOrder,
          currentBuildName: DEFAULT_BUILD_NAME,
          lastSavedSnapshot: null,
        })
      },
      renameBuild: (id, name) => {
        const trimmed = name.trim()
        if (!trimmed) return
        set({
          savedBuilds: get().savedBuilds.map((b) => (b.id === id ? { ...b, name: trimmed } : b)),
        })
      },
    }),
    {
      name: "spicy-techs-main-store",
      version: 4,
      migrate: (persistedState, version) => {
        // Migration depuis l'ancienne version ou données corrompues
        if (version === 0 || !persistedState) {
          return {
            selectedFaction: "atreides",
            mainBaseState: mainBasesState,
            buildingOrder: initialBuildingOrder,
            currentBuildName: DEFAULT_BUILD_NAME,
            savedBuilds: [],
            lastSavedSnapshot: null,
          }
        }
        const state = persistedState as MainStore
        // Vérifie que mainBaseState est au bon format
        if (!state.mainBaseState || typeof state.mainBaseState !== "object") {
          return {
            ...state,
            mainBaseState: mainBasesState,
            buildingOrder: initialBuildingOrder,
            currentBuildName: state.currentBuildName ?? DEFAULT_BUILD_NAME,
            savedBuilds: state.savedBuilds ?? [],
            lastSavedSnapshot: (state as MainStore).lastSavedSnapshot ?? null,
          }
        }
        // Vérifie chaque faction
        for (const faction of FACTION_LABELS) {
          const factionState = state.mainBaseState[faction as FactionLabel]
          if (!Array.isArray(factionState)) {
            return {
              ...state,
              mainBaseState: mainBasesState,
              buildingOrder: initialBuildingOrder,
              currentBuildName: state.currentBuildName ?? DEFAULT_BUILD_NAME,
              savedBuilds: state.savedBuilds ?? [],
              lastSavedSnapshot: (state as MainStore).lastSavedSnapshot ?? null,
            }
          }
        }
        // Migration v1 -> v2 : ajouter buildingOrder si absent
        if (version === 1 || !state.buildingOrder) {
          return {
            ...state,
            buildingOrder: initialBuildingOrder,
            currentBuildName: state.currentBuildName ?? DEFAULT_BUILD_NAME,
            savedBuilds: state.savedBuilds ?? [],
            lastSavedSnapshot: (state as MainStore).lastSavedSnapshot ?? null,
          }
        }
        // Migration v2 -> v3 : ajouter currentBuildName et savedBuilds
        if (version === 2) {
          return {
            ...state,
            currentBuildName: state.currentBuildName ?? DEFAULT_BUILD_NAME,
            savedBuilds: Array.isArray(state.savedBuilds) ? state.savedBuilds : [],
            lastSavedSnapshot: (state as MainStore).lastSavedSnapshot ?? null,
          }
        }
        // Migration v3 -> v4 : ajouter lastSavedSnapshot
        if (version === 3) {
          return {
            ...state,
            lastSavedSnapshot: (state as MainStore).lastSavedSnapshot ?? null,
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

/** Retourne l'ordre des bâtiments pour la faction actuelle */
export function useCurrentBuildingOrder(): BuildingCoords[] {
  const selectedFaction = useMainStore((state) => state.selectedFaction)
  const buildingOrder = useMainStore((state) => state.buildingOrder)
  return buildingOrder[selectedFaction] ?? []
}

/** Retourne le numéro d'ordre d'un bâtiment (1-based) ou null si non trouvé */
export function getBuildingOrderNumber(
  order: BuildingCoords[],
  rowIndex: number,
  groupIndex: number,
  cellIndex: number
): number | null {
  const index = order.findIndex(
    (coord) => coord.rowIndex === rowIndex && coord.groupIndex === groupIndex && coord.cellIndex === cellIndex
  )
  return index >= 0 ? index + 1 : null
}

