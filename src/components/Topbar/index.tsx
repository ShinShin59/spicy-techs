interface TopbarProps {
  buildsOpen: boolean
  onToggleBuilds: () => void
}

const Topbar = ({ buildsOpen, onToggleBuilds }: TopbarProps) => {
  return (
    <header className="w-full h-10 shrink-0 flex items-center justify-end gap-2 px-4 bg-zinc-900/80 border-b border-zinc-700">
      <button
        type="button"
        onClick={onToggleBuilds}
        aria-pressed={buildsOpen}
        aria-label="Ouvrir la liste des builds"
        className={`px-3 py-1.5 text-sm font-medium rounded border transition-colors ${buildsOpen
            ? "bg-amber-600 border-amber-500 text-white"
            : "bg-zinc-800 border-zinc-600 text-zinc-200 hover:bg-zinc-700"
          }`}
      >
        Builds
      </button>
    </header>
  )
}

export default Topbar
