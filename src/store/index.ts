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

/** Id du build sauvegardé en cours d'édition (null = build non sauvegardé / nouveau) */
export type CurrentBuildId = string | null

interface MainStore {
  selectedFaction: FactionLabel
  setSelectedFaction: (faction: FactionLabel) => void
  mainBaseState: Record<FactionLabel, MainBaseState>
  buildingOrder: BuildingOrderState
  currentBuildName: string
  /** Build sauvegardé qu'on édite ; null si build neuf ou chargé depuis URL */
  currentBuildId: CurrentBuildId
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
  /** Change de faction : sauvegarde le build courant s'il a du contenu, puis démarre un nouveau build pour la faction. */
  switchFaction: (faction: FactionLabel) => void
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

/** Nom par défaut pour un nouveau build : "faction N" avec N = prochain numéro pour cette faction */
export function getDefaultBuildName(
  faction: FactionLabel,
  savedBuilds: SavedBuild[]
): string {
  const factionNumRegex = new RegExp(`^${faction}\\s+(\\d+)$`)
  const existingNums = savedBuilds
    .map((b) => b.name.match(factionNumRegex)?.[1])
    .filter(Boolean)
    .map((s) => parseInt(s!, 10))
  const nextNum = existingNums.length === 0 ? 1 : Math.max(...existingNums) + 1
  return `${faction} ${nextNum}`
}

/** Retourne un nom unique : si le nom existe déjà (chez d'autres builds), ajoute " #1", " #2", etc. */
export function getUniqueBuildName(
  baseName: string,
  savedBuilds: SavedBuild[],
  excludeId?: string
): string {
  const others = savedBuilds.filter((b) => b.id !== excludeId)
  const exactOrWithNum = others.filter(
    (b) => b.name === baseName || b.name.startsWith(baseName + " #")
  )
  if (exactOrWithNum.length === 0) return baseName
  const suffix = baseName + " #"
  const nums = exactOrWithNum
    .filter((b) => b.name.startsWith(suffix))
    .map((b) => parseInt(b.name.slice(suffix.length), 10))
    .filter((n) => !Number.isNaN(n))
  const nextNum = nums.length === 0 ? 1 : Math.max(...nums) + 1
  return `${baseName} #${nextNum}`
}

const INITIAL_BUILD_NAME = "atreides 1"

/** True si la base de la faction n'a aucun bâtiment. */
function isFactionBaseEmpty(
  mainBaseState: Record<FactionLabel, MainBaseState>,
  faction: FactionLabel
): boolean {
  const state = mainBaseState[faction]
  if (!state || !Array.isArray(state)) return true
  for (const row of state) {
    if (!Array.isArray(row)) continue
    for (const group of row) {
      if (!Array.isArray(group)) continue
      for (const cell of group) {
        if (cell !== null) return false
      }
    }
  }
  return true
}

export const useMainStore = create<MainStore>()(
  persist(
    (set, get) => ({
      selectedFaction: "atreides",
      setSelectedFaction: (faction) => set({ selectedFaction: faction }),
      switchFaction: (faction) => {
        const g = get()
        if (faction === g.selectedFaction) return
        if (!isFactionBaseEmpty(g.mainBaseState, g.selectedFaction)) {
          get().saveCurrentBuild()
        }
        set({
          selectedFaction: faction,
          currentBuildId: null,
          currentBuildName: getDefaultBuildName(faction, get().savedBuilds),
        })
      },
      mainBaseState: mainBasesState,
      buildingOrder: initialBuildingOrder,
      currentBuildName: INITIAL_BUILD_NAME,
      currentBuildId: null,
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
          currentBuildId: null,
        })
      },
      setCurrentBuildName: (name) => {
        const { selectedFaction, savedBuilds } = get()
        set({
          currentBuildName:
            name.trim() || getDefaultBuildName(selectedFaction, savedBuilds),
        })
      },
      saveCurrentBuild: (name) => {
        const {
          selectedFaction,
          mainBaseState,
          buildingOrder,
          savedBuilds,
          currentBuildName,
          currentBuildId,
        } = get()
        const defaultName = getDefaultBuildName(selectedFaction, savedBuilds)
        const rawName =
          (name?.trim() || currentBuildName.trim() || defaultName).trim() || defaultName
        const existing =
          currentBuildId !== null
            ? savedBuilds.find((b) => b.id === currentBuildId)
            : null
        const finalName = getUniqueBuildName(rawName, savedBuilds, existing?.id)
        const snapshot = getBuildSnapshot({
          selectedFaction,
          mainBaseState,
          buildingOrder,
          currentBuildName: finalName,
        })
        if (existing) {
          const existingIndex = savedBuilds.findIndex((b) => b.id === existing.id)
          const updated: SavedBuild = {
            ...existing,
            name: finalName,
            selectedFaction,
            mainBaseState: JSON.parse(JSON.stringify(mainBaseState)),
            buildingOrder: JSON.parse(JSON.stringify(buildingOrder)),
            createdAt: Date.now(),
          }
          const newSavedBuilds = [...savedBuilds]
          newSavedBuilds[existingIndex] = updated
          set({
            savedBuilds: newSavedBuilds,
            lastSavedSnapshot: snapshot,
            currentBuildName: finalName,
          })
        } else {
          const saved: SavedBuild = {
            id: generateBuildId(),
            name: finalName,
            createdAt: Date.now(),
            selectedFaction,
            mainBaseState: JSON.parse(JSON.stringify(mainBaseState)),
            buildingOrder: JSON.parse(JSON.stringify(buildingOrder)),
          }
          set({
            savedBuilds: [saved, ...savedBuilds],
            lastSavedSnapshot: snapshot,
            currentBuildName: finalName,
            currentBuildId: saved.id,
          })
        }
      },
      loadBuild: (id) => {
        const { savedBuilds } = get()
        const build = savedBuilds.find((b) => b.id === id)
        if (!build) return
        const snapshot = getBuildSnapshot({
          selectedFaction: build.selectedFaction,
          mainBaseState: build.mainBaseState,
          buildingOrder: build.buildingOrder,
          currentBuildName: build.name,
        })
        set({
          selectedFaction: build.selectedFaction,
          mainBaseState: JSON.parse(JSON.stringify(build.mainBaseState)),
          buildingOrder: JSON.parse(JSON.stringify(build.buildingOrder)),
          currentBuildName: build.name,
          currentBuildId: id,
          lastSavedSnapshot: snapshot,
        })
      },
      deleteBuild: (id) => {
        const { savedBuilds, currentBuildId } = get()
        const build = savedBuilds.find((b) => b.id === id)
        if (!build) return
        if (currentBuildId === id) {
          const newSaved = savedBuilds.filter((b) => b.id !== id)
          set({
            selectedFaction: "atreides",
            mainBaseState: mainBasesState,
            buildingOrder: initialBuildingOrder,
            currentBuildName: getDefaultBuildName("atreides", newSaved),
            currentBuildId: null,
            lastSavedSnapshot: null,
            savedBuilds: newSaved,
          })
        } else {
          set({ savedBuilds: savedBuilds.filter((b) => b.id !== id) })
        }
      },
      resetToDefault: () => {
        const { savedBuilds } = get()
        set({
          selectedFaction: "atreides",
          mainBaseState: mainBasesState,
          buildingOrder: initialBuildingOrder,
          currentBuildName: getDefaultBuildName("atreides", savedBuilds),
          currentBuildId: null,
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
      version: 6,
      migrate: (persistedState, version) => {
        const fallbackName = (s: MainStore | undefined) => {
          if (!s) return INITIAL_BUILD_NAME
          if (s.currentBuildName === "My build")
            return getDefaultBuildName("atreides", s.savedBuilds ?? [])
          return s.currentBuildName ?? INITIAL_BUILD_NAME
        }
        const withCurrentBuildId = (s: Partial<MainStore>) => ({
          ...s,
          currentBuildId: (s as MainStore).currentBuildId ?? null,
        })
        if (version === 0 || !persistedState) {
          return withCurrentBuildId({
            selectedFaction: "atreides",
            mainBaseState: mainBasesState,
            buildingOrder: initialBuildingOrder,
            currentBuildName: INITIAL_BUILD_NAME,
            currentBuildId: null,
            savedBuilds: [],
            lastSavedSnapshot: null,
          })
        }
        const state = persistedState as MainStore
        if (!state.mainBaseState || typeof state.mainBaseState !== "object") {
          return withCurrentBuildId({
            ...state,
            mainBaseState: mainBasesState,
            buildingOrder: initialBuildingOrder,
            currentBuildName: fallbackName(state),
            savedBuilds: state.savedBuilds ?? [],
            lastSavedSnapshot: state.lastSavedSnapshot ?? null,
          })
        }
        for (const faction of FACTION_LABELS) {
          const factionState = state.mainBaseState[faction as FactionLabel]
          if (!Array.isArray(factionState)) {
            return withCurrentBuildId({
              ...state,
              mainBaseState: mainBasesState,
              buildingOrder: initialBuildingOrder,
              currentBuildName: fallbackName(state),
              savedBuilds: state.savedBuilds ?? [],
              lastSavedSnapshot: state.lastSavedSnapshot ?? null,
            })
          }
        }
        if (version === 1 || !state.buildingOrder) {
          return withCurrentBuildId({
            ...state,
            buildingOrder: initialBuildingOrder,
            currentBuildName: fallbackName(state),
            savedBuilds: state.savedBuilds ?? [],
            lastSavedSnapshot: state.lastSavedSnapshot ?? null,
          })
        }
        if (version === 2) {
          return withCurrentBuildId({
            ...state,
            currentBuildName: fallbackName(state),
            savedBuilds: Array.isArray(state.savedBuilds) ? state.savedBuilds : [],
            lastSavedSnapshot: state.lastSavedSnapshot ?? null,
          })
        }
        if (version === 3) {
          return withCurrentBuildId({ ...state, lastSavedSnapshot: state.lastSavedSnapshot ?? null })
        }
        if (version === 4) {
          return withCurrentBuildId({ ...state, currentBuildName: fallbackName(state) })
        }
        if (version === 5) {
          return withCurrentBuildId(state)
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

/** Le build courant est-il à jour par rapport à la dernière sauvegarde ? */
export function useIsBuildUpToDate(): boolean {
  const lastSavedSnapshot = useMainStore((s) => s.lastSavedSnapshot)
  const selectedFaction = useMainStore((s) => s.selectedFaction)
  const mainBaseState = useMainStore((s) => s.mainBaseState)
  const buildingOrder = useMainStore((s) => s.buildingOrder)
  const currentBuildName = useMainStore((s) => s.currentBuildName)
  const currentSnapshot = getBuildSnapshot({
    selectedFaction,
    mainBaseState,
    buildingOrder,
    currentBuildName,
  })
  return lastSavedSnapshot !== null && currentSnapshot === lastSavedSnapshot
}

/** Le build courant (faction active) a-t-il au moins un bâtiment ? */
export function useIsBuildEmpty(): boolean {
  const selectedFaction = useMainStore((s) => s.selectedFaction)
  const mainBaseState = useMainStore((s) => s.mainBaseState)
  const state = mainBaseState[selectedFaction]
  if (!state || !Array.isArray(state)) return true
  for (const row of state) {
    if (!Array.isArray(row)) continue
    for (const group of row) {
      if (!Array.isArray(group)) continue
      for (const cell of group) {
        if (cell !== null) return false
      }
    }
  }
  return true
}

