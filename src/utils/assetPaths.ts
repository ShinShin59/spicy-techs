import { FACTION_LABELS, type FactionLabel } from "@/store"
import armoryData from "@/components/Armory/armory.json"
import mainBuildingsData from "@/components/MainBase/MainBaseBuildingsSelector/main-buildings.json"

const FACTION_ICON_PATH = "/images/faction_buttons_square"
const MAINBASE_ICONS_PATH = "/images/mainbase_icons"
const GEAR_ICONS_PATH = "/images/gear"

export function getFactionIconPath(faction: FactionLabel): string {
  return `${FACTION_ICON_PATH}/${faction}.png`
}

export function getBuildingIconPath(buildingName: string): string {
  return `${MAINBASE_ICONS_PATH}/${buildingName.toLowerCase().replace(/ /g, "_")}.png`
}

export function getGearIconPath(imageFileName: string): string {
  return `${GEAR_ICONS_PATH}/${imageFileName}`
}

/** Set of URLs that have been preloaded */
const preloadedImages = new Set<string>()

/** Preload a single image and track it */
function preloadImage(src: string): void {
  if (preloadedImages.has(src)) return
  preloadedImages.add(src)
  const img = new Image()
  img.src = src
}

/** Check if an image URL has been preloaded */
export function isImagePreloaded(src: string): boolean {
  return preloadedImages.has(src)
}

/**
 * Preload all app images immediately at module load time.
 * This runs synchronously when this module is first imported,
 * before any React components render.
 */
function initPreload(): void {
  // Preload faction icons
  FACTION_LABELS.forEach((faction) => {
    preloadImage(getFactionIconPath(faction as FactionLabel))
  })

  // Preload building icons
  const buildings = mainBuildingsData as { name: string }[]
  buildings.forEach((b) => {
    preloadImage(getBuildingIconPath(b.name))
  })

  // Preload gear icons
  const gearItems = armoryData as { image: string }[]
  const uniqueImages = new Set(gearItems.map((g) => g.image))
  uniqueImages.forEach((image) => {
    preloadImage(getGearIconPath(image))
  })
}

// Run preload immediately when module is imported (before React renders)
initPreload()
