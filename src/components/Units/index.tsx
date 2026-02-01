import { useState } from "react"
import { useMainStore, useCurrentUnitSlots, HERO_SLOT_INDEX, MAX_UNIT_SLOT_COUNT, MAX_UNIT_CP } from "@/store"
import { getUnitIconPath } from "@/utils/assetPaths"
import { playRandomSound, BUTTON_SPENDRESOURCES_SOUNDS } from "@/utils/sound"
import { getUnitById, type UnitData } from "./units-utils"
import { getHeroById, getHeroIconPath, isHeroId } from "./heroes-utils"
import UnitsSelector from "./UnitsSelector"
import UnitTooltip from "./UnitTooltip"
import PanelCorners from "@/components/PanelCorners"

interface AnchorPosition {
  x: number
  y: number
}

const cellClass =
  "w-[64px] h-[64px] flex items-center justify-center overflow-hidden text-white text-xs font-medium"

const Units = () => {
  const selectedFaction = useMainStore((s) => s.selectedFaction)
  const unitSlotCount = useMainStore((s) => s.unitSlotCount)
  const addUnitSlot = useMainStore((s) => s.addUnitSlot)
  const setUnitSlot = useMainStore((s) => s.setUnitSlot)
  const removeUnitSlot = useMainStore((s) => s.removeUnitSlot)
  const unitSlots = useCurrentUnitSlots()

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null)
  const [anchorPosition, setAnchorPosition] = useState<AnchorPosition | null>(null)
  const [hoverTooltip, setHoverTooltip] = useState<{
    unit: UnitData | { name: string; desc?: string }
    anchorRect: { left: number; top: number; width: number; height: number }
  } | null>(null)

  const handleSlotClick = (e: React.MouseEvent, slotIndex: number) => {
    // Add slot (0) and hero slot (1) can open the selector; other slots cannot
    if (slotIndex !== 0 && slotIndex !== HERO_SLOT_INDEX) return
    const rect = e.currentTarget.getBoundingClientRect()
    setAnchorPosition({ x: rect.left, y: rect.top })
    setSelectedSlotIndex(slotIndex)
  }

  const handleSelectUnit = (unitId: string | null) => {
    if (selectedSlotIndex === null) return
    if (selectedSlotIndex === HERO_SLOT_INDEX) {
      // Hero slot: set hero and close selector
      setUnitSlot(HERO_SLOT_INDEX, unitId)
      setSelectedSlotIndex(null)
      setAnchorPosition(null)
      return
    }
    if (selectedSlotIndex === 0) {
      // Add slot: assign to first empty unit slot (2..N), or add a new slot if all full (respect 65 CP cap)
      if (unitId !== null) {
        const unitData = getUnitById(selectedFaction, unitId)
        const unitCost = unitData?.cpCost ?? 0
        if (totalCP + unitCost > MAX_UNIT_CP) return
        let placed = false
        for (let k = 2; k < unitSlotCount; k++) {
          if (unitSlots[k] == null) {
            setUnitSlot(k, unitId)
            placed = true
            playRandomSound(BUTTON_SPENDRESOURCES_SOUNDS)
            break
          }
        }
        if (!placed && unitSlotCount < MAX_UNIT_SLOT_COUNT) {
          const newIndex = addUnitSlot()
          if (newIndex !== undefined) {
            setUnitSlot(newIndex, unitId)
            playRandomSound(BUTTON_SPENDRESOURCES_SOUNDS)
          }
        }
      }
      // Keep selector open; user closes it by clicking outside
    }
  }

  const handleCloseSelector = () => {
    setSelectedSlotIndex(null)
    setAnchorPosition(null)
  }

  const totalCP = unitSlots.reduce((sum, unitId) => {
    if (!unitId) return sum
    const unitData = !isHeroId(unitId) ? getUnitById(selectedFaction, unitId) : null
    return sum + (unitData?.cpCost ?? 0)
  }, 0)

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
        <div className="flex justify-end items-center gap-2 mb-0">
          <span className="text-xs font-mono text-white/70">
            {totalCP} CP
          </span>
          <h2 className="text-xs font-mono font-bold text-white/70 uppercase m-0">
            Units
          </h2>
        </div>
        <div
          id="units-grid"
          className="relative bg-zinc-900 border border-zinc-700 w-[432px] gap-4 p-4  box-border overflow-y-auto min-h-0"
        >
          <PanelCorners />
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: unitSlotCount }).map((_, index) => {
              const isAddSlot = index === 0
              const unitId = unitSlots[index] ?? null
              const isHeroSlot = index === HERO_SLOT_INDEX
              const heroData = unitId && isHeroId(unitId) ? getHeroById(selectedFaction, unitId) : null
              const unitData = unitId && !isHeroId(unitId) ? getUnitById(selectedFaction, unitId) : null
              const displayData = heroData ?? unitData ?? null
              const hasUnit = unitId !== null && unitId !== undefined && displayData !== null

              const isHeroSlotEmpty = isHeroSlot && !hasUnit
              const cellStyle = isAddSlot
                ? "bg-[url('/images/hud/slot_add.png')] bg-cover bg-center hover:bg-[url('/images/hud/slot_add_hover.png')]"
                : isHeroSlot
                  ? "bg-[url('/images/hud/background_hero.png')] bg-cover bg-center"
                  : hasUnit
                    ? "bg-[url('/images/hud/slot.png')] bg-cover bg-center"
                    : "bg-[url('/images/hud/slot.png')] bg-cover bg-center hover:brightness-110"
              const heroSlotMuted = isHeroSlotEmpty ? "opacity-70" : ""
              const canOpenSelector = index === 0 || index === HERO_SLOT_INDEX

              return (
                <div
                  key={`unit-${index}`}
                  role={canOpenSelector ? "button" : undefined}
                  tabIndex={canOpenSelector ? 0 : undefined}
                  className={`${cellClass} relative ${canOpenSelector ? "cursor-pointer" : "cursor-default"} ${cellStyle} ${heroSlotMuted}`}
                  id={`units-slot-${index}`}
                  title={isAddSlot ? "Add unit" : isHeroSlotEmpty ? "Hero slot (optional)" : undefined}
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
                  {!isAddSlot && hasUnit && heroData && (
                    <img
                      src={getHeroIconPath(selectedFaction, heroData.imageName)}
                      alt={heroData.name}
                      loading="eager"
                      decoding="sync"
                      className="w-16 h-16 object-contain"
                    />
                  )}
                  {!isAddSlot && hasUnit && unitData && (
                    <img
                      src={getUnitIconPath(selectedFaction, unitData.name)}
                      alt={unitData.name}
                      loading="eager"
                      decoding="sync"
                      className="w-16 h-16 object-contain"
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
              remainingCP={selectedSlotIndex === 0 ? MAX_UNIT_CP - totalCP : undefined}
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
