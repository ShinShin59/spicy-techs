import { useCallback } from "react"
import { daysToAGDate, agDateToTotalDays, AG_START_YEAR } from "@/utils/techCost"

/** AG calendar colors from design (same as MonthEstimation) */
const AG_COLORS = {
  text: "#D57E3B",
  barFilled: "#D57E3B",
  barUnfilled: "#6C4C33",
} as const

export interface DatePickerProps {
  /** Total days since 01.01.10192 AG */
  totalDays: number
  /** Called when date changes */
  onChange: (totalDays: number) => void
  /** Optional compact mode */
  compact?: boolean
}

export default function DatePicker({
  totalDays,
  onChange,
  compact,
}: DatePickerProps) {
  const { monthProgress, day, month, year } = daysToAGDate(totalDays)

  const setDay = useCallback(
    (d: number) => {
      onChange(agDateToTotalDays(d, month, year))
    },
    [month, year, onChange]
  )
  const setMonth = useCallback(
    (m: number) => {
      onChange(agDateToTotalDays(day, m, year))
    },
    [day, year, onChange]
  )
  const setYear = useCallback(
    (y: number) => {
      onChange(agDateToTotalDays(day, month, y))
    },
    [day, month, onChange]
  )

  const dayHandlers = {
    onClick: () => setDay(Math.min(30, day + 1)),
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
      setDay(Math.max(1, day - 1))
    },
  }
  const monthHandlers = {
    onClick: () => setMonth(Math.min(12, month + 1)),
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
      setMonth(Math.max(1, month - 1))
    },
  }
  const yearHandlers = {
    onClick: () => setYear(year + 1),
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
      setYear(Math.max(AG_START_YEAR, year - 1))
    },
  }

  return (
    <div
      className="rounded px-2 py-1.5 tabular-nums"
      style={{
        color: AG_COLORS.text,
        fontSize: compact ? "0.65rem" : "0.75rem",
      }}
    >
      <div className="flex items-center gap-1 flex-wrap">
        <span
          role="button"
          tabIndex={0}
          className="cursor-pointer select-none hover:underline"
          onClick={dayHandlers.onClick}
          onContextMenu={dayHandlers.onContextMenu}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              dayHandlers.onClick()
            }
          }}
        >
          {String(day).padStart(2, "0")}
        </span>
        <span>.</span>
        <span
          role="button"
          tabIndex={0}
          className="cursor-pointer select-none hover:underline"
          onClick={monthHandlers.onClick}
          onContextMenu={monthHandlers.onContextMenu}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              monthHandlers.onClick()
            }
          }}
        >
          {String(month).padStart(2, "0")}
        </span>
        <span>.</span>
        <span
          role="button"
          tabIndex={0}
          className="cursor-pointer select-none hover:underline"
          onClick={yearHandlers.onClick}
          onContextMenu={yearHandlers.onContextMenu}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              yearHandlers.onClick()
            }
          }}
        >
          {year}
        </span>
        <span> AG</span>
      </div>
      <div
        className="mt-1 h-[2px] w-full overflow-hidden"
        style={{ backgroundColor: AG_COLORS.barUnfilled }}
      >
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${Math.min(100, monthProgress * 100)}%`,
            backgroundColor: AG_COLORS.barFilled,
          }}
        />
      </div>
    </div>
  )
}
