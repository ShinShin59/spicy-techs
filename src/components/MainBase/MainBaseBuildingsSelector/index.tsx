import { useMainStore, type FactionLabel } from "@/store"
import mainBuildingsData from "./main-buildings.json"

export interface MainBuilding {
  id: string
  name: string
  attributes: string[]
  category: 'Economy' | 'Military' | 'Statecraft'
  excludeFromFaction?: FactionLabel
  onlyForFaction?: FactionLabel
}

const mainBuildings = mainBuildingsData as MainBuilding[]

interface MainBaseBuildingsSelectorProps {
  onClose: () => void
  onSelect: (buildingId: string | null) => void
  /** IDs des bâtiments déjà présents dans la base */
  usedBuildingIds: string[]
}


const MainBaseBuildingsSelector = ({
  onClose,
  onSelect,
}: MainBaseBuildingsSelectorProps) => {
  const selectedFaction = useMainStore((s) => s.selectedFaction)
  const availableBuildings = mainBuildings.filter((building) => {
    return (
      building.excludeFromFaction !== selectedFaction &&
      (!building.onlyForFaction || building.onlyForFaction === selectedFaction)
    )
  })

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-red-500/50"
      onClick={onClose}
    >
      {/* Modal content */}
      <div
        className="w-[384px] h-[320px] bg-zinc-900  flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Buildings list */}
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-2">
            {/* Option to clear the slot */}
            <button
              onClick={() => onSelect(null)}
              className=""
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-900/50 rounded flex items-center justify-center">
                  ❌
                </div>
              </div>
            </button>

            {/* Available buildings */}
            {availableBuildings.map((building) => (

              (<button
                key={building.id}
                onClick={() => onSelect(building.id)}
                className="">
                <img src={`/images/mainbase_icons/${building.name.toLowerCase().replace(" ", "_")}.png`} alt={building.name} className="w-10 h-10" />
              </button>)))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainBaseBuildingsSelector
