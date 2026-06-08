'use client'

import { useState, useEffect, useRef } from 'react'

const SCRIPT_SRC = 'https://cdn.trustindex.io/loader.js?05b79d07309f7483595629e00fc'

export function TrustindexReviews() {
  const [mounted, setMounted] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const container = containerRef.current
    if (!container) return
    if (container.querySelector(`script[src="${SCRIPT_SRC}"]`)) return

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => setLoaded(true)
    script.onerror = () => setLoaded(true)
    container.appendChild(script)

    return () => {
      const s = container.querySelector('script')
      if (s) s.remove()
    }
  }, [mounted])

  if (!mounted) {
    return (
      <div
        className="min-h-[320px] md:min-h-[480px] w-full animate-pulse rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50"
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[320px] md:min-h-[480px]"
    >
      {!loaded && (
        <div className="absolute inset-0 w-full animate-pulse rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50" />
      )}
      <div
        className={`transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
