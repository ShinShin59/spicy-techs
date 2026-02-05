import { useState, useRef, useEffect } from "react"
import { useMainStore, getSharePayloadFromState } from "@/store"
import { useShallow } from "zustand/react/shallow"
import { encodeBuildPayload, getShareUrlPreferShort } from "@/utils/buildShare"

export function useShareButton() {
  const sharePayload = useMainStore(useShallow(getSharePayloadFromState))
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  const handleShare = async () => {
    const encoded = encodeBuildPayload(sharePayload)
    const url = await getShareUrlPreferShort(encoded)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Ignore clipboard errors – nothing else to do in a pure-frontend app.
    }
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    setCopied(true)
    copyTimeoutRef.current = setTimeout(() => {
      setCopied(false)
      copyTimeoutRef.current = null
    }, 800)
  }

  return { copied, handleShare }
}
