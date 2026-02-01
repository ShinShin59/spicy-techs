import { useState, useMemo, useEffect, useRef } from "react"
import { useMainStore } from "@/store"
import { getUnitIconPath } from "@/utils/assetPaths"
import { getUnitsForFaction, type UnitData } from "./units-utils"
import {
  getHeroesForFaction,
  getHeroIconPath,
  type HeroData,
} from "./heroes-utils"
import UnitTooltip from "./UnitTooltip"

interface AnchorPosition {
  x: number
  y: number
}

export interface UnitsSelectorProps {
  onClose: () => void
  onSelect: (unitId: string | null) => void
  anchorPosition: AnchorPosition
  heroOnly?: boolean
  /** When adding units: remaining CP budget (65 - totalCP). Units with cpCost > this are disabled. */
  remainingCP?: number
}

const UnitsSelector = ({
  onClose,
  onSelect,
  anchorPosition,
  heroOnly = false,
  remainingCP,
}: UnitsSelectorProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const selectedFaction = useMainStore((s) => s.selectedFaction)
  const [hoverTooltip, setHoverTooltip] = useState<{
    unit: UnitData | HeroData
    anchorRect: { left: number; top: number; width: number; height: number }
  } | null>(null)

  // Close on outside click (allows click to propagate to other elements)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  // Get available units or heroes for current faction
  const units = useMemo(
    () =>
      heroOnly
        ? getHeroesForFaction(selectedFaction)
        : getUnitsForFaction(selectedFaction),
    [selectedFaction, heroOnly]
  )

  // Position the popup above the clicked slot
  const popupStyle = useMemo<React.CSSProperties>(
    () => ({
      position: "fixed",
      left: anchorPosition.x,
      bottom: window.innerHeight - anchorPosition.y,
    }),
    [anchorPosition.x, anchorPosition.y]
  )

  return (
    <>
      {/* Modal content */}
      <div
        ref={modalRef}
        className="z-50 bg-zinc-900 border border-zinc-700 flex flex-col"
        style={popupStyle}
      >

        {/* Units/Heroes grid */}
        <div className="flex p-3 gap-1 flex-wrap">
          {units.map((unit) => {
            const unitCost = !heroOnly ? (unit as UnitData).cpCost ?? 0 : 0
            const overBudget = remainingCP != null && unitCost > remainingCP
            const disabled = !heroOnly && overBudget
            return (
              <div
                key={unit.id}
                className="w-16 h-16 shrink-0"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setHoverTooltip({
                    unit,
                    anchorRect: {
                      left: rect.left,
                      top: rect.top,
                      width: rect.width,
                      height: rect.height,
                    },
                  })
                }}
                onMouseLeave={() => setHoverTooltip(null)}
              >
                <button
                  type="button"
                  onClick={() => !disabled && onSelect(unit.id)}
                  disabled={disabled}
                  className={`w-full h-full flex items-center justify-center ${
                    disabled
                      ? "opacity-50 cursor-not-allowed grayscale"
                      : "hover:brightness-125 cursor-pointer"
                  }`}
                >
                  <img
                    src={
                      heroOnly
                        ? getHeroIconPath(selectedFaction, (unit as HeroData).imageName)
                        : getUnitIconPath(selectedFaction, (unit as UnitData).name)
                    }
                    alt={unit.name}
                    loading="eager"
                    decoding="sync"
                    className="w-16 h-16 object-contain"
                  />
                </button>
              </div>
            )
          })}
        </div>

        {/* Show message if no units available */}
        {units.length === 0 && !heroOnly && (
          <div className="px-4 py-2 text-zinc-500 text-sm">
            No units available for this faction
          </div>
        )}
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

export default UnitsSelector
