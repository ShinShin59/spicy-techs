import { FACTION_LABELS, useMainStore, type FactionLabel } from "@/store"
import { getFactionIconPath } from "@/utils/assetPaths"

const FactionSelector = () => {
  const selectedFaction = useMainStore((s) => s.selectedFaction)
  const switchFaction = useMainStore((s) => s.switchFaction)
  const iconPath = getFactionIconPath(selectedFaction)

  return (
    <label className="cursor-pointer">
      <select
        id="faction-selector"
        value={selectedFaction}
        onChange={(e) => switchFaction(e.target.value as FactionLabel)}
        className="pl-6 text-center py-1.5 text-sm font-medium rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colorsg-no-repeat bg-size-[1.25rem_1.25rem] bg-position-[left_0.25rem_center] bg-no-repeat"
        style={{ backgroundImage: `url(${iconPath})` }}
      >
        {FACTION_LABELS.map((label) => (
          <option key={label as FactionLabel} value={label as FactionLabel}>
            {label as FactionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

export default FactionSelector