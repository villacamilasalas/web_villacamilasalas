'use client'

import { useState, useEffect, useRef } from 'react'

const SCRIPT_SRC = 'https://cdn.trustindex.io/loader.js?05b79d07309f7483595629e00fc'

export function TrustindexReviews() {
  const [loaded, setLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (container.querySelector(`script[src="${SCRIPT_SRC}"]`)) return

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => setLoaded(true)
    script.onerror = () => setLoaded(true)

    container.appendChild(script)

    const safetyTimeout = setTimeout(() => setLoaded(true), 4000)

    return () => {
      clearTimeout(safetyTimeout)
      const s = container.querySelector('script')
      if (s) s.remove()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[320px] md:min-h-[480px]"
    >
      {!loaded && (
        <div
          className="absolute inset-0 w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 animate-pulse flex items-center justify-center text-neutral-400 text-sm font-medium"
          aria-hidden="true"
        >
          Cargando opiniones de Google...
        </div>
      )}
    </div>
  )
}
