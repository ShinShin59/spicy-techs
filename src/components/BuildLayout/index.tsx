import type { ReactNode } from "react"

interface BuildLayoutProps {
  mainBase?: ReactNode
  units?: ReactNode
  armory?: ReactNode
}

/**
 * Layout container for the build tiles.
 * - Top row: MainBase | Units (side by side)
 * - Bottom row: Armory (full width of container)
 * Tiles maintain their intrinsic sizes.
 */
const BuildLayout = ({ mainBase, units, armory }: BuildLayoutProps) => {
  const hasTopRow = mainBase || units

  return (
    <div className="flex flex-col gap-6">
      {/* Top row: MainBase and Units side by side */}
      {hasTopRow && (
        <div className="flex gap-6 items-start justify-center">
          {mainBase}
          {units}
        </div>
      )}

      {/* Bottom row: Armory (full width) */}
      {armory}
    </div>
  )
}

export default BuildLayout
