import { useEffect, useMemo, useState } from "react"
import MainBase from "./components/MainBase"
import FactionSelector from "./components/FactionSelector"
import BuildNameEditable from "./components/BuildNameEditable"
import Topbar from "./components/Topbar"
import BuildsSidebar from "./components/BuildsSidebar"
import { useMainStore, getBuildSnapshot } from "./store"
import { decodeBuildPayload } from "./utils/mainBaseShare"

function isBuildEmpty(mainBaseState: Record<string, (string | null)[][][]>, selectedFaction: string): boolean {
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

function App() {
  const [buildsOpen, setBuildsOpen] = useState(false)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const [feedbackFading, setFeedbackFading] = useState(false)
  const saveCurrentBuild = useMainStore((s) => s.saveCurrentBuild)
  const resetToDefault = useMainStore((s) => s.resetToDefault)
  const lastSavedSnapshot = useMainStore((s) => s.lastSavedSnapshot)
  const selectedFaction = useMainStore((s) => s.selectedFaction)
  const mainBaseState = useMainStore((s) => s.mainBaseState)
  const buildingOrder = useMainStore((s) => s.buildingOrder)
  const currentBuildName = useMainStore((s) => s.currentBuildName)
  const currentSnapshot = getBuildSnapshot({ selectedFaction, mainBaseState, buildingOrder, currentBuildName })
  const isUpToDate = lastSavedSnapshot !== null && currentSnapshot === lastSavedSnapshot
  const isEmpty = useMemo(() => isBuildEmpty(mainBaseState, selectedFaction), [mainBaseState, selectedFaction])
  const showSaveButton = (!isUpToDate || showSavedFeedback) && !isEmpty

  useEffect(() => {
    const payload = decodeBuildPayload(window.location.search)
    if (payload) {
      useMainStore.getState().loadSharedBuild(payload)
    }
  }, [])

  useEffect(() => {
    if (showSavedFeedback && !feedbackFading) {
      const t = setTimeout(() => setFeedbackFading(true), 1000)
      return () => clearTimeout(t)
    }
  }, [showSavedFeedback, feedbackFading])

  useEffect(() => {
    if (feedbackFading) {
      const t = setTimeout(() => {
        setShowSavedFeedback(false)
        setFeedbackFading(false)
      }, 500)
      return () => clearTimeout(t)
    }
  }, [feedbackFading])

  const handleSave = () => {
    saveCurrentBuild()
    setShowSavedFeedback(true)
    setFeedbackFading(false)
  }

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col overflow-hidden">
      <Topbar
        buildsOpen={buildsOpen}
        onToggleBuilds={() => setBuildsOpen((o) => !o)}
        onCreate={() => resetToDefault()}
      />
      <div className="flex-1 relative flex flex-col items-center justify-center gap-6 p-4 overflow-auto">
        <div className="flex flex-col items-center gap-3">
          <FactionSelector />
          <BuildNameEditable />
        </div>
        <div id="BUILD" className="relative">
          <MainBase />
          {showSaveButton && (
            <button
              type="button"
              onClick={showSavedFeedback ? undefined : handleSave}
              disabled={showSavedFeedback}
              className={`absolute -bottom-12 right-2 px-4 py-1 text-white text-sm font-medium rounded transition-opacity duration-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black ${showSavedFeedback
                ? `bg-green-600 ${feedbackFading ? "opacity-0" : "opacity-100"}`
                : "bg-error hover:opacity-90"
                }`}
            >
              {showSavedFeedback ? "saved!" : "Save"}
            </button>
          )}
        </div>
      </div>
      {buildsOpen && <BuildsSidebar onClose={() => setBuildsOpen(false)} />}
    </div>
  )
}

export default App
