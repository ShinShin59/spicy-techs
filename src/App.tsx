import { useEffect } from "react"
import MainBase from "./components/MainBase"
import Topbar from "./components/Topbar"
import BuildsSidebar from "./components/BuildsSidebar"
import { useMainStore, useUIStore } from "./store"
import { decodeBuildPayload } from "./utils/mainBaseShare"

function App() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const resetToDefault = useMainStore((s) => s.resetToDefault)

  useEffect(() => {
    const payload = decodeBuildPayload(window.location.search)
    if (payload) {
      useMainStore.getState().loadSharedBuild(payload)
    }
  }, [])

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col overflow-hidden">
      <Topbar onCreate={() => resetToDefault()} />
      <div className="flex-1 relative flex flex-col items-center justify-center gap-6 p-4 overflow-auto">
        <div id="BUILD" className="relative">
          <MainBase />
        </div>
      </div>
      {sidebarOpen && <BuildsSidebar onClose={() => setSidebarOpen(false)} />}
    </div>
  )
}

export default App
