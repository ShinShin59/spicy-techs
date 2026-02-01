import type { ReactNode } from "react"

interface BuildLayoutProps {
  mainBase?: ReactNode
  units?: ReactNode
  councillors?: ReactNode
  armory?: ReactNode
}

/**
 * Layout container for the build tiles.
 * - Top row: MainBase | Units | Councillors (side by side)
 * - Bottom row: Armory (full width of container)
 * Tiles maintain their intrinsic sizes.
 */
const BuildLayout = ({ mainBase, units, councillors, armory }: BuildLayoutProps) => {
  const hasTopRow = mainBase || units || councillors

  return (
    <div className="flex flex-col gap-6">
      {/* Top row: MainBase, Units and Councillors side by side */}
      {hasTopRow && (
        <div className="flex gap-10 items-start">
          <div className="flex-1 min-w-[332px]">{mainBase}</div>
          {units}
          {councillors}
        </div>
      )}

      {/* Bottom row: Armory (full width) */}
      {armory}
    </div>
  )
}

export default BuildLayout
