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

/**
 * Retourne la liste des bâtiments disponibles pour une faction donnée,
 * en excluant ceux déjà utilisés.
 */
function getAvailableBuildingsForFaction(
  faction: FactionLabel,
  usedBuildingIds: string[]
): MainBuilding[] {
  return mainBuildings.filter((building) => {
    // Exclure les bâtiments déjà utilisés
    if (usedBuildingIds.includes(building.id)) {
      return false
    }

    // Si le bâtiment est exclusif à une faction
    if (building.factionExclusive) {
      // Ne l'inclure que si c'est la bonne faction
      return building.factionExclusive === faction
    }

    // Pour les bâtiments génériques, vérifier s'il existe une version faction-exclusive
    // qui remplacerait ce bâtiment pour cette faction
    const hasExclusiveReplacement = mainBuildings.some(
      (b) =>
        b.factionExclusive === faction && b.replacesGeneric === building.id
    )

    // Si une version exclusive existe pour cette faction, ne pas inclure le générique
    if (hasExclusiveReplacement) {
      return false
    }

    return true
  })
}

const MainBaseBuildingsSelector = ({
  onClose,
  onSelect,
  usedBuildingIds,
}: MainBaseBuildingsSelectorProps) => {
  const selectedFaction = useMainStore((s) => s.selectedFaction)
  const availableBuildings = getAvailableBuildingsForFaction(
    selectedFaction,
    usedBuildingIds
  )

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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-lg font-semibold text-white">
            Sélectionner un bâtiment
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-700 rounded transition-colors"
          >
            ❌
          </button>
        </div>

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
                <div>
                  <h3 className="font-medium text-red-400 group-hover:text-red-300">
                    Vider l'emplacement
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Retirer le bâtiment actuel
                  </p>
                </div>
              </div>
            </button>

            {/* Available buildings */}
            {availableBuildings.map((building) => (
              <button
                key={building.id}
                onClick={() => onSelect(building.id)}
                className="p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-left transition-colors"
              >
                <h3 className="font-medium text-amber-400">{building.name}</h3>
                {building.attributes.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {building.attributes.map((attr, idx) => (
                      <li key={idx} className="text-sm text-zinc-400">
                        • {attr}
                      </li>
                    ))}
                  </ul>
                )}
                {building.factionExclusive && (
                  <span className="mt-2 inline-block text-xs px-2 py-0.5 bg-amber-900/50 text-amber-300 rounded">
                    {building.factionExclusive}
                  </span>
                )}
              </button>
            ))}
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
