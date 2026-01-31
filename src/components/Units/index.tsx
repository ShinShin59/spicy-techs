import { useMainStore, MAX_UNIT_SLOT_COUNT } from "@/store"

const cellClass =
  "w-[64px] h-[64px] flex items-center justify-center overflow-hidden border border-zinc-700 bg-zinc-600 hover:bg-zinc-500 text-white text-xs font-medium"

const Units = () => {
  const unitSlotCount = useMainStore((s) => s.unitSlotCount)
  const addUnitSlot = useMainStore((s) => s.addUnitSlot)
  const canAdd = unitSlotCount < MAX_UNIT_SLOT_COUNT

  return (
    <div className="flex flex-col">
      <h2 className="text-xs font-mono font-bold text-white/70 uppercase m-0 ml-auto">
        Units
      </h2>
      <div
        id="units-grid"
        className="relative bg-zinc-900 border border-zinc-700 w-[432px] max-h-[420px] gap-4 p-4 box-border overflow-y-auto min-h-0"
      >
        <div
          className="grid grid-cols-5 gap-4"
        >
          {canAdd && (
            <button
              type="button"
              onClick={addUnitSlot}
              className={`${cellClass} cursor-pointer`}
              id="units-slot-add"
              aria-label="Add unit slot"
            >
              +
            </button>
          )}
          {Array.from({ length: unitSlotCount - 1 }).map((_, index) => (
            <div
              key={`unit-${index}`}
              className={cellClass}
              id={`units-slot-${index}`}
            >
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}

export default Units
