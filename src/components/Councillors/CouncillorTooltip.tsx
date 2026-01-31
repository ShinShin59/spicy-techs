const OFFSET = 8

export interface CouncillorTooltipProps {
  councillor: { name: string; description?: string; attributes?: string[] }
  anchorRect: { left: number; top: number; width: number; height: number }
}

export default function CouncillorTooltip({
  councillor,
  anchorRect,
}: CouncillorTooltipProps) {
  const style: React.CSSProperties = {
    position: "fixed",
    left: anchorRect.left + anchorRect.width + OFFSET,
    top: anchorRect.top,
    maxWidth: 320,
  }

  return (
    <div
      className="z-60 bg-zinc-900 border border-zinc-600 shadow-lg pointer-events-none overflow-hidden"
      style={style}
    >
      <div className="px-3 py-2 border-b border-zinc-700/80 bg-zinc-700">
        <div className="text-zinc-100 font-semibold text-sm uppercase tracking-wide">
          {councillor.name}
        </div>
      </div>

      {councillor.attributes && councillor.attributes.length > 0 && (
        <div className="px-3 py-1.5 border-b border-zinc-700/50 text-zinc-400 text-xs">
          {councillor.attributes.join(", ")}
        </div>
      )}

      {councillor.description ? (
        <div className="px-3 py-2 text-zinc-300 text-sm">
          {councillor.description}
        </div>
      ) : (
        <div className="px-3 py-2 text-zinc-500 text-sm italic">
          No description available
        </div>
      )}
    </div>
  )
}
