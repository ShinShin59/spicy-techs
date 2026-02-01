import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"

export interface ShuffleProps {
  text: string
  shuffleDirection?: "up" | "down"
  duration?: number
  animationMode?: "evenodd" | "random"
  shuffleTimes?: number
  ease?: string
  stagger?: number
  threshold?: number
  triggerOnce?: boolean
  triggerOnHover?: boolean
  respectReducedMotion?: boolean
  loop?: boolean
  loopDelay?: number
  /** When true, treat as in-view for triggerOnce (e.g. after parent fade-in) */
  ready?: boolean
  className?: string
  style?: React.CSSProperties
}

function getRandomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
}

function buildStrip(
  char: string,
  length: number,
  realIndex: number
): string[] {
  const strip: string[] = []
  for (let i = 0; i < length; i++) {
    strip.push(i === realIndex ? char : getRandomChar())
  }
  return strip
}

export default function Shuffle({
  text,
  shuffleDirection = "down",
  duration = 0.2,
  animationMode = "evenodd",
  shuffleTimes: _shuffleTimes = 1,
  ease = "power2.out",
  stagger = 0.06,
  threshold = 0.1,
  triggerOnce = true,
  triggerOnHover = false,
  respectReducedMotion = true,
  loop: _loop = false,
  loopDelay: _loopDelay = 0,
  ready: externalReady = false,
  className = "",
  style,
}: ShuffleProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [hasTriggered, setHasTriggered] = useState(false)
  const [inView, setInView] = useState(false)
  const isReady = externalReady || inView
  const [reducedMotion, setReducedMotion] = useState(false)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!respectReducedMotion) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const handler = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [respectReducedMotion])

  useEffect(() => {
    if (!containerRef.current || !triggerOnce) return
    const el = containerRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [triggerOnce, threshold])

  const runAnimation = () => {
    if (!containerRef.current || reducedMotion) return
    const wrappers = containerRef.current.querySelectorAll<HTMLSpanElement>(
      "[data-shuffle-char]"
    )
    if (!wrappers.length) return

    const stripLength = 12
    const realIndex = Math.floor(stripLength / 2)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      wrappers.forEach((wrap, i) => {
        const inner = wrap.querySelector<HTMLDivElement>("[data-shuffle-inner]")
        if (!inner) return
        const delay =
          animationMode === "evenodd" ? (i % 2) * stagger : i * stagger
        const fromY = shuffleDirection === "down" ? 0 : -realIndex * 100
        const toY = shuffleDirection === "down" ? -realIndex * 100 : 0
        tl.fromTo(
          inner,
          { yPercent: fromY },
          {
            yPercent: toY,
            duration,
            ease,
            delay,
          },
          delay
        )
      })
      timelineRef.current = tl
    }, containerRef)
    return () => ctx.revert()
  }

  useGSAP(
    () => {
      if (!triggerOnce) {
        runAnimation()
        return
      }
      if (isReady && !hasTriggered) {
        setHasTriggered(true)
        runAnimation()
      }
    },
    { dependencies: [isReady, hasTriggered, triggerOnce], scope: containerRef }
  )

  const handleMouseEnter = () => {
    if (triggerOnHover && containerRef.current && !reducedMotion) {
      const wrappers = containerRef.current.querySelectorAll<HTMLSpanElement>(
        "[data-shuffle-char]"
      )
      const stripLength = 12
      const realIndex = Math.floor(stripLength / 2)
      wrappers.forEach((wrap, i) => {
        const inner = wrap.querySelector<HTMLDivElement>("[data-shuffle-inner]")
        if (!inner) return
        const delay =
          animationMode === "evenodd" ? (i % 2) * stagger : i * stagger
        const fromY = shuffleDirection === "down" ? 0 : -realIndex * 100
        const toY = shuffleDirection === "down" ? -realIndex * 100 : 0
        gsap.fromTo(
          inner,
          { yPercent: fromY },
          { yPercent: toY, duration, ease, delay }
        )
      })
    }
  }

  if (reducedMotion) {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    )
  }

  const stripLength = 12
  const realIndex = Math.floor(stripLength / 2)

  return (
    <span
      ref={containerRef}
      className={className}
      style={style}
      onMouseEnter={triggerOnHover ? handleMouseEnter : undefined}
      role="text"
      aria-label={text}
    >
      {text.split("").map((char, i) => {
        const strip = buildStrip(char, stripLength, realIndex)
        const isSpace = char === " "
        if (isSpace) {
          return <span key={i}>&nbsp;</span>
        }
        return (
          <span
            key={i}
            data-shuffle-char
            style={{
              display: "inline-block",
              overflow: "hidden",
              height: "1em",
              verticalAlign: "top",
            }}
          >
            <div
              data-shuffle-inner
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                willChange: "transform",
              }}
            >
              {strip.map((c, j) => (
                <span key={j} style={{ height: "1em", lineHeight: 1 }}>
                  {c}
                </span>
              ))}
            </div>
          </span>
        )
      })}
    </span>
  )
}
