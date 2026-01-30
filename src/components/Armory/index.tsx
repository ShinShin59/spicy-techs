const COLS = 2
const ROWS = 5

const Armory = () => {
  return (
    <div className="flex flex-col">
      <h2 className="text-xs font-mono font-bold text-white/70 uppercase m-0 ml-auto">
        Armory
      </h2>
      <div
        id="armory-grid"
        className="relative bg-zinc-900 border border-zinc-700 h-[420px] flex flex-col justify-center items-center gap-4 p-4 box-border"
      >
        {Array.from({ length: ROWS }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4" id={`armory-row-${rowIndex}`}>
            {Array.from({ length: COLS }).map((_, colIndex) => (
              <div
                key={colIndex}
                role="button"
                tabIndex={0}
                className="w-[64px] h-[64px] cursor-pointer flex items-center justify-center overflow-hidden border border-zinc-700 bg-zinc-600 hover:bg-zinc-500"
                id={`armory-slot-${rowIndex}-${colIndex}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Armory
