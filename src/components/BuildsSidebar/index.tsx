import { useState, useRef, useEffect } from "react"
import { useMainStore, type SavedBuild } from "@/store"

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-70">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
)

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-70 hover:opacity-100 hover:text-red-400 transition-all">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
)

interface BuildRowProps {
  build: SavedBuild
  onLoad: () => void
  onDelete: () => void
  onRename: (name: string) => void
}

function BuildRow({ build, onLoad, onDelete, onRename }: BuildRowProps) {
  const [renaming, setRenaming] = useState(false)
  const [editValue, setEditValue] = useState(build.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(build.name)
  }, [build.name])

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [renaming])

  const handleRenameSubmit = () => {
    const trimmed = editValue.trim()
    if (trimmed) onRename(trimmed)
    setRenaming(false)
  }

  const handleRowClick = (e: React.MouseEvent) => {
    if (renaming) return
    const target = e.target as HTMLElement
    if (target.closest("[data-pencil]") || target.closest("[data-trash]") || target.closest("input")) return
    onLoad()
  }

  if (renaming) {
    return (
      <div className="flex items-center gap-2 py-1.5 px-2 rounded bg-zinc-800">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRenameSubmit()
            if (e.key === "Escape") {
              setEditValue(build.name)
              setRenaming(false)
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 bg-zinc-700 text-white border border-zinc-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          aria-label="Nouveau nom"
        />
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onLoad()
        }
      }}
      className="group flex items-center gap-2 py-2 px-3 rounded border border-transparent hover:bg-zinc-800 hover:border-zinc-600 cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-inset"
    >
      <span className="min-w-0 flex-1 truncate text-white">{build.name}</span>
      <button
        type="button"
        data-pencil
        onClick={(e) => {
          e.stopPropagation()
          setRenaming(true)
        }}
        aria-label="Renommer"
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-700 transition-all shrink-0"
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        data-trash
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        aria-label="Supprimer le build"
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-700 transition-all shrink-0"
      >
        <TrashIcon />
      </button>
    </div>
  )
}

interface BuildsSidebarProps {
  onClose: () => void
}

const BuildsSidebar = ({ onClose }: BuildsSidebarProps) => {
  const savedBuilds = useMainStore((s) => s.savedBuilds)
  const loadBuild = useMainStore((s) => s.loadBuild)
  const deleteBuild = useMainStore((s) => s.deleteBuild)
  const renameBuild = useMainStore((s) => s.renameBuild)

  const sortedSaved = [...savedBuilds].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <>
      <div
        role="presentation"
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-hidden
      />
      <aside
        className="fixed top-1/2 right-3 z-50 w-[280px] max-w-[90vw] max-h-[70vh] -translate-y-1/2 flex flex-col rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden"
        aria-label="Liste des builds"
      >
        <div className="flex items-center justify-between p-3 border-b border-zinc-700 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-200">Builds</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-3 space-y-2 min-h-0">
          {sortedSaved.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4 text-center">Aucun build sauvegardé</p>
          ) : (
            sortedSaved.map((build) => (
              <BuildRow
                key={build.id}
                build={build}
                onLoad={() => loadBuild(build.id)}
                onDelete={() => deleteBuild(build.id)}
                onRename={(name) => renameBuild(build.id, name)}
              />
            ))
          )}
        </div>
      </aside>
    </>
  )
}

export default BuildsSidebar
