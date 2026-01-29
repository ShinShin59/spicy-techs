import { useMainStore, type FactionLabel } from "@/store"
import mainBuildingsData from "./main-buildings.json"

export interface MainBuilding {
  id: string
  name: string
  attributes: string[]
  factionExclusive?: FactionLabel
  replacesGeneric?: string
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
    debugger
    return building.factionExclusive === selectedFaction || !building.factionExclusive
  })

  console.log(availableBuildings)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal content */}
      <div
        className="relative z-10 w-[80%] max-w-4xl max-h-[80%] bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Buildings list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Option to clear the slot */}
            <button
              onClick={() => onSelect(null)}
              className="p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-left transition-colors group"
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
                className="p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-left transition-colors">
                <img src={`/assets/buildings/${building.id}.png`} alt={building.name} className="w-10 h-10" />
                {building.factionExclusive && (
                  <span className="mt-2 inline-block text-xs px-2 py-0.5 bg-amber-900/50 text-amber-300 rounded">
                    {building.factionExclusive}
                  </span>
                )}
              </button>)))}
          </div>

          {availableBuildings.length === 0 && (
            <p className="text-center text-zinc-500 py-8">
              Aucun bâtiment disponible
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MainBaseBuildingsSelector
