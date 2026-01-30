import { create } from "zustand"
import { persist } from "zustand/middleware"

const UI_STORAGE_KEY = "spicy-techs-ui"

interface UIStore {
  /** Whether the build list sidebar is open. */
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  /** Whether the Main Base panel is visible. */
  mainBaseOpen: boolean
  setMainBaseOpen: (open: boolean) => void
  toggleMainBase: () => void
  /** Whether the Armory panel is visible. */
  armoryOpen: boolean
  setArmoryOpen: (open: boolean) => void
  toggleArmory: () => void
  /** Whether the Units panel is visible. */
  unitsOpen: boolean
  setUnitsOpen: (open: boolean) => void
  toggleUnits: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      mainBaseOpen: true,
      setMainBaseOpen: (open) => set({ mainBaseOpen: open }),
      toggleMainBase: () => set((s) => ({ mainBaseOpen: !s.mainBaseOpen })),
      armoryOpen: true,
      setArmoryOpen: (open) => set({ armoryOpen: open }),
      toggleArmory: () => set((s) => ({ armoryOpen: !s.armoryOpen })),
      unitsOpen: true,
      setUnitsOpen: (open) => set({ unitsOpen: open }),
      toggleUnits: () => set((s) => ({ unitsOpen: !s.unitsOpen })),
    }),
    { name: UI_STORAGE_KEY }
  )
)
