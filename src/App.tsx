import { useEffect, useState } from "react"
import MainBase from "./components/MainBase"
import FactionSelector from "./components/FactionSelector"
import BuildNameEditable from "./components/BuildNameEditable"
import Topbar from "./components/Topbar"
import BuildsSidebar from "./components/BuildsSidebar"
import { useMainStore } from "./store"
import { decodeBuildPayload } from "./utils/mainBaseShare"

function App() {
  const [buildsOpen, setBuildsOpen] = useState(false)
  const saveCurrentBuild = useMainStore((s) => s.saveCurrentBuild)

  useEffect(() => {
    const payload = decodeBuildPayload(window.location.search)
    if (payload) {
      useMainStore.getState().loadSharedBuild(payload)
    }
  }, [])

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col overflow-hidden">
      <Topbar buildsOpen={buildsOpen} onToggleBuilds={() => setBuildsOpen((o) => !o)} />
      <div className="flex-1 relative flex flex-col items-center justify-center gap-6 p-4 overflow-auto">
        <div className="flex flex-col items-center gap-3">
          <FactionSelector />
          <BuildNameEditable />
        </div>
        <div id="BUILD" className="relative">
          <MainBase />
          <button
            type="button"
            onClick={() => saveCurrentBuild()}
            className="absolute -bottom-12 right-2 px-4 py-1  text-white text-sm font-medium rounded"
          >
            Save
          </button>
        </div>
      </div>
      {buildsOpen && <BuildsSidebar onClose={() => setBuildsOpen(false)} />}
    </div>
  )
}

export default App
