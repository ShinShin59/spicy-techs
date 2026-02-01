import { createContext } from "react"

/** Height of the Main Base panel in px; used so Units panel can match max height and scale slots. */
export const MainBaseHeightContext = createContext<number | null>(null)
