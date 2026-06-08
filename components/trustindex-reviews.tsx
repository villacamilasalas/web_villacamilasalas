'use client'

import { useState, useEffect, useRef } from 'react'

export function TrustindexReviews() {
  const [loaded, setLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || containerRef.current.querySelector('script')) return

    const script = document.createElement('script')
    script.src = 'https://cdn.trustindex.io/loader.js?05b79d07309f7483595629e00fc'
    script.defer = true
    script.async = true
    script.onload = () => {
      setTimeout(() => setLoaded(true), 100)
    }
    containerRef.current.appendChild(script)
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
      <div
        className={`transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ minHeight: 'inherit' }}
      />
    </div>
  )
}
