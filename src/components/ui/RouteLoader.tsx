'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Slim progress bar at the top of the viewport that fires on every
 * client-side route change. Uses a CSS animation so it stays off the
 * main thread as much as possible.
 */
export function RouteLoader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (pathname === prevPath.current) return
    prevPath.current = pathname

    // Show bar
    setVisible(true)

    // Hide after animation completes (~1.8 s)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 1900)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      key={pathname}            /* re-mount to restart animation */
      className="route-bar"
      aria-hidden="true"
    />
  )
}
