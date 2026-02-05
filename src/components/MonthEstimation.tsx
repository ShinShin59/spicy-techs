import { daysToAGDate, formatAGDate } from "@/utils/techCost"

/** AG calendar colors from design */
const AG_COLORS = {
  text: "#D57E3B",
  barFilled: "#D57E3B",
  barUnfilled: "#6C4C33",
} as const

export interface MonthEstimationProps {
  /** Total days since 01.01.10192 AG */
  totalDays: number
  /** Optional compact mode (smaller text, thinner bar) */
  compact?: boolean
}

export default function MonthEstimation({ totalDays, compact }: MonthEstimationProps) {
  const { monthProgress } = daysToAGDate(totalDays)
  const dateStr = formatAGDate(totalDays)

  return (
    <div
      className="rounded px-2 py-1.5 tabular-nums"
      style={{
        color: AG_COLORS.text,
        fontSize: compact ? "0.65rem" : "0.75rem",
      }}
    >
      <div>{dateStr}</div>
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
