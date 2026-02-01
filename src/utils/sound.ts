const SOUNDS_PATH = "/sounds"

/**
 * Get the full path for a sound file (filename with or without .mp3).
 */
export function getSoundPath(name: string): string {
  const base = name.endsWith(".mp3") ? name : `${name}.mp3`
  return base.startsWith("/") ? base : `${SOUNDS_PATH}/${base}`
}

/**
 * Play a single sound by path or filename.
 * Path can be full (e.g. "/sounds/Button_Spendresources.mp3") or just the filename.
 */
/** Default volume (0–1). Half of full so app sounds are 2× softer. */
const DEFAULT_VOLUME = 0.5

export function playSound(pathOrName: string): void {
  const path = pathOrName.startsWith("/") ? pathOrName : getSoundPath(pathOrName)
  const audio = new Audio(path)
  audio.volume = DEFAULT_VOLUME
  audio.play().catch(() => {})
}

/**
 * Create a function that alternates between two sounds on each call (e.g. for a toggle button).
 * First call plays pathA, second pathB, third pathA, etc.
 */
export function createToggleSound(pathA: string, pathB: string): () => void {
  let nextIsA = true
  return () => {
    playSound(nextIsA ? pathA : pathB)
    nextIsA = !nextIsA
  }
}

/**
 * Play a random sound from the given array of paths or filenames.
 */
export function playRandomSound(paths: string[]): void {
  if (paths.length === 0) return
  const path = paths[Math.floor(Math.random() * paths.length)]
  playSound(path)
}

// --- Convenience: common sound sets (filenames under /sounds) ---

export const BUTTON_SPENDRESOURCES_SOUNDS = [
  "Button_Spendresources.mp3",
  "Button_Spendresources_2.mp3",
  "Button_Spendresources_3.mp3",
  "Button_Spendresources_4.mp3",
]
