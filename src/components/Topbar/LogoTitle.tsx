import { useState, useEffect } from "react"
import Shuffle from "@/components/Shuffle"

export default function LogoTitle() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    document.fonts.load('1em "Dune Rise"').then(() => setVisible(true))
    const fallback = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(fallback)
  }, [])

  return (
    <h1
      className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[130px] z-20 pointer-events-none font-display font-bold uppercase tracking-[0.12em] text-center text-5xl md:text-6xl transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{
        fontFamily: "var(--font-display)",
        filter:
          "drop-shadow(0 0 40px rgba(0,0,0,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
      }}
    >
      <Shuffle
        text="SPICY TECHS"
        className="logo-title-halo inline-block"
        shuffleDirection="down"
        duration={0.2}
        animationMode="evenodd"
        shuffleTimes={1}
        ease="power2.out"
        stagger={0.06}
        threshold={0.1}
        triggerOnce={true}
        triggerOnHover
        respectReducedMotion={true}
        loop={false}
        loopDelay={0}
        ready={visible}
      />
    </h1>
  )
}
