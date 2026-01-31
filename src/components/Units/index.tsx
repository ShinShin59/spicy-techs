import { useState } from "react"
import {
  useMainStore,
  useCurrentUnitSlots,
  useCurrentUnitsOrder,
  getUnitsOrderNumber,
  MAX_UNIT_SLOT_COUNT,
  HERO_SLOT_INDEX,
} from "@/store"
import { getUnitIconPath } from "@/utils/assetPaths"
import { getUnitById, type UnitData } from "./units-utils"
import { getHeroById, getHeroIconPath, isHeroId } from "./heroes-utils"
import UnitsSelector from "./UnitsSelector"
import UnitTooltip from "./UnitTooltip"
import OrderBadge from "@/components/OrderBadge"
import { incrementOrder, decrementOrder, unitIsEqual } from "@/hooks/useItemOrder"

interface AnchorPosition {
  x: number
  y: number
}

const cellClass =
  "w-[64px] h-[64px] flex items-center justify-center overflow-hidden border border-zinc-700 text-white text-xs font-medium"

const Units = () => {
  const selectedFaction = useMainStore((s) => s.selectedFaction)
  const unitSlotCount = useMainStore((s) => s.unitSlotCount)
  const addUnitSlot = useMainStore((s) => s.addUnitSlot)
  const setUnitSlot = useMainStore((s) => s.setUnitSlot)
  const removeUnitSlot = useMainStore((s) => s.removeUnitSlot)
  const updateUnitsOrder = useMainStore((s) => s.updateUnitsOrder)
  const unitSlots = useCurrentUnitSlots()
  const unitsOrder = useCurrentUnitsOrder()

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null)
  const [anchorPosition, setAnchorPosition] = useState<AnchorPosition | null>(null)
  const [hoverTooltip, setHoverTooltip] = useState<{
    unit: UnitData | { name: string; desc?: string }
    anchorRect: { left: number; top: number; width: number; height: number }
  } | null>(null)

  const handleSlotClick = (e: React.MouseEvent, slotIndex: number) => {
    // Don't open selector if clicking on the order badge
    const target = e.target as HTMLElement
    if (target.closest("[data-order-badge]")) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    setAnchorPosition({ x: rect.left, y: rect.top })
    setSelectedSlotIndex(slotIndex)
  }

  const handleSelectUnit = (unitId: string | null) => {
    if (selectedSlotIndex !== null) {
      setUnitSlot(selectedSlotIndex, unitId)
      setSelectedSlotIndex(null)
      setAnchorPosition(null)

      // Auto-add a new slot if all unit slots (excluding hero) are now filled
      if (unitId !== null && unitSlotCount < MAX_UNIT_SLOT_COUNT) {
        let emptyCount = 0
        for (let i = 0; i < unitSlotCount; i++) {
          if (i === HERO_SLOT_INDEX) continue
          const slotValue = i === selectedSlotIndex ? unitId : unitSlots[i]
          if (slotValue === null || slotValue === undefined) {
            emptyCount++
          }
        }
        if (emptyCount === 0) {
          addUnitSlot()
        }
      }
    }
  }

  const handleCloseSelector = () => {
    setSelectedSlotIndex(null)
    setAnchorPosition(null)
  }

  const handleSlotRightClick = (e: React.MouseEvent, slotIndex: number) => {
    e.preventDefault()
    const unitId = unitSlots[slotIndex]
    if (unitId !== null && unitId !== undefined) {
      if (slotIndex === HERO_SLOT_INDEX) {
        setUnitSlot(HERO_SLOT_INDEX, null)
      } else {
        removeUnitSlot(slotIndex)
      }
      setHoverTooltip(null)
    }
  }

  return (
    <>
      <div className="flex flex-col">
        <h2 className="text-xs font-mono font-bold text-white/70 uppercase m-0 ml-auto">
          Units
        </h2>
        <div
          id="units-grid"
          className="relative bg-zinc-900 border border-zinc-700 w-[432px] gap-4 p-4  box-border overflow-y-auto min-h-0"
        >
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: unitSlotCount }).map((_, index) => {
              const unitId = unitSlots[index] ?? null
              const isHeroSlot = index === HERO_SLOT_INDEX
              const heroData = unitId && isHeroId(unitId) ? getHeroById(selectedFaction, unitId) : null
              const unitData = unitId && !isHeroId(unitId) ? getUnitById(selectedFaction, unitId) : null
              const displayData = heroData ?? unitData ?? null
              const hasUnit = unitId !== null && unitId !== undefined && displayData !== null
              const orderNumber = getUnitsOrderNumber(unitsOrder, index)

              const isHeroSlotEmpty = isHeroSlot && !hasUnit
              const cellStyle = isHeroSlotEmpty
                ? "bg-zinc-800/60 border-zinc-600/60 hover:bg-zinc-700/60"
                : hasUnit
                  ? "bg-zinc-700"
                  : "bg-zinc-600 hover:bg-zinc-500"

              return (
                <div
                  key={`unit-${index}`}
                  role="button"
                  tabIndex={0}
                  className={`${cellClass} relative cursor-pointer ${cellStyle}`}
                  id={`units-slot-${index}`}
                  title={isHeroSlotEmpty ? "Hero slot (optional)" : undefined}
                  onClick={(e) => handleSlotClick(e, index)}
                  onContextMenu={(e) => handleSlotRightClick(e, index)}
                  onMouseEnter={
                    hasUnit && displayData
                      ? (e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setHoverTooltip({
                            unit: displayData,
                            anchorRect: {
                              left: rect.left,
                              top: rect.top,
                              width: rect.width,
                              height: rect.height,
                            },
                          })
                        }
                      : undefined
                  }
                  onMouseLeave={hasUnit ? () => setHoverTooltip(null) : undefined}
                >
                  {hasUnit && heroData && (
                    <img
                      src={getHeroIconPath(selectedFaction, heroData.imageName)}
                      alt={heroData.name}
                      loading="eager"
                      decoding="sync"
                      className="w-16 h-16 object-contain"
                    />
                  )}
                  {hasUnit && unitData && (
                    <img
                      src={getUnitIconPath(selectedFaction, unitData.name)}
                      alt={unitData.name}
                      loading="eager"
                      decoding="sync"
                      className="w-16 h-16 object-contain"
                    />
                  )}
                  {orderNumber !== null && (
                    <OrderBadge
                      orderNumber={orderNumber}
                      onIncrement={() => updateUnitsOrder(incrementOrder(unitsOrder, index, unitIsEqual))}
                      onDecrement={() => updateUnitsOrder(decrementOrder(unitsOrder, index, unitIsEqual))}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Unit selector popup */}
          {selectedSlotIndex !== null && anchorPosition && (
            <UnitsSelector
              onClose={handleCloseSelector}
              onSelect={handleSelectUnit}
              anchorPosition={anchorPosition}
              heroOnly={selectedSlotIndex === HERO_SLOT_INDEX}
            />
          )}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoverTooltip && (
        <UnitTooltip
          unit={hoverTooltip.unit}
          anchorRect={hoverTooltip.anchorRect}
        />
      )}
    </>
  )
}

export default Units
