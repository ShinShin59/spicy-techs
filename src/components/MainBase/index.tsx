import { useState } from "react"
import { useCurrentMainBaseLayout, useCurrentMainBaseState, useMainStore, useUsedBuildingIds } from "../../store"
import MainBaseBuildingsSelector, { type MainBuilding } from "./MainBaseBuildingsSelector"
import mainBuildingsData from "./MainBaseBuildingsSelector/main-buildings.json"

const mainBuildings = mainBuildingsData as MainBuilding[]

/** Trouve un bâtiment par son ID */
function getBuildingById(id: string | null): MainBuilding | undefined {
  if (!id) return undefined
  return mainBuildings.find((b) => b.id === id)
}

interface SelectedCell {
  rowIndex: number
  groupIndex: number
  cellIndex: number
}

const MainBase = () => {
  const layout = useCurrentMainBaseLayout()
  const mainBaseState = useCurrentMainBaseState()
  const setMainBaseCell = useMainStore((state) => state.setMainBaseCell)
  const usedBuildingIds = useUsedBuildingIds()

  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null)

  const handleCellClick = (rowIndex: number, groupIndex: number, cellIndex: number) => {
    setSelectedCell({ rowIndex, groupIndex, cellIndex })
  }

  const handleSelectBuilding = (buildingId: string | null) => {
    if (selectedCell) {
      setMainBaseCell(selectedCell.rowIndex, selectedCell.groupIndex, selectedCell.cellIndex, buildingId)
      setSelectedCell(null)
    }
  }

  const handleCloseSelector = () => {
    setSelectedCell(null)
  }

  return (
    <>
      <div
        id="main-base-grid"
        className="bg-red-500 w-[384px] h-[320px] flex flex-col justify-center items-center gap-12"
      >
        {layout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex" id={`main-base-row-${rowIndex}`}>
            {row.map((building, groupIndex) => (
              <div
                key={groupIndex}
                className="flex mx-4"
                id={`main-base-building-block-${groupIndex}`}
              >
                {Array.from({ length: building }).map((_, cellIndex) => {
                  const buildingId = mainBaseState[rowIndex]?.[groupIndex]?.[cellIndex]
                  const buildingData = getBuildingById(buildingId)
                  const hasBuilding = buildingId !== null

                  return (
                    <div
                      key={cellIndex}
                      role="button"
                      tabIndex={0}
                      className={`w-[64px] h-[64px] cursor-pointer flex items-center justify-center text-xs text-center p-1 overflow-hidden ${hasBuilding ? "bg-amber-500 text-black font-medium" : "bg-blue-500 text-white/50"
                        }`}
                      id={`main-base-building-${cellIndex}`}
                      onClick={() => handleCellClick(rowIndex, groupIndex, cellIndex)}
                      title={buildingData?.name || "Vide"}
                    >
                      {buildingData?.name || ""}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {selectedCell && (
        <MainBaseBuildingsSelector
          onClose={handleCloseSelector}
          onSelect={handleSelectBuilding}
          usedBuildingIds={usedBuildingIds}
        />
      )}
    </>
  )
}

export default MainBase