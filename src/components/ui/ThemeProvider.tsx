'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

const STORAGE_KEY = 'reckon-theme'

function readStored(fallback: Theme): Theme {
  if (typeof window === 'undefined') return fallback
  return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? fallback
}

function resolveTheme(t: Theme): 'light' | 'dark' {
  if (t !== 'system') return t
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyClass(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  // Lazy init reads localStorage on the client only — avoids setState-in-effect
  const [theme, setThemeState] = useState<Theme>(() => readStored(defaultTheme))
  const [resolvedTheme, setResolved] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    const t = readStored(defaultTheme)
    const r = resolveTheme(t)
    applyClass(r)
    return r
  })

  // Listen for OS preference changes when in 'system' mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onchange = () => {
      const current = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? defaultTheme
      if (current === 'system') {
        const r = resolveTheme('system')
        applyClass(r)
        setResolved(r)
      }
    }
    mq.addEventListener('change', onchange)
    return () => mq.removeEventListener('change', onchange)
  }, [defaultTheme])

  function setTheme(t: Theme) {
    const r = resolveTheme(t)
    localStorage.setItem(STORAGE_KEY, t)
    applyClass(r)
    setThemeState(t)
    setResolved(r)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
