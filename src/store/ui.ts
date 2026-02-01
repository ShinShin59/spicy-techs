import { create } from "zustand"
import { persist } from "zustand/middleware"

const UI_STORAGE_KEY = "spicy-techs-ui"

interface UIStore {
  // Reserved for future UI state (e.g. preferences)
}

export const useUIStore = create<UIStore>()(
  persist(
    () => ({}),
    {
      name: UI_STORAGE_KEY,
      migrate: (persisted: unknown) => {
        const p = persisted as Record<string, unknown> | null
        if (!p || typeof p !== "object") return {} as UIStore
        const { sidebarOpen: _removed, ...rest } = p
        return rest as UIStore
      },
    }
  )
)
