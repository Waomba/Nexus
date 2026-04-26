import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const ThemeContext = createContext(null)

/**
 * Three themes:
 *   dark     — Deep Charcoal #121212 (always dark)
 *   light    — Pure White #FFFFFF (always light)
 *   adaptive — Follows device system preference automatically
 */

function applyTheme(theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)

  // Update meta theme-color for mobile status bar
  let meta = document.querySelector('meta[name=theme-color]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }

  if (theme === 'dark') {
    meta.content = 'var(--bg-card)'
  } else if (theme === 'light') {
    meta.content = '#FFFFFF'
  } else {
    // adaptive: follow system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    meta.content = prefersDark ? '#121212' : '#FFFFFF'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('nexus_theme')
    // Migrate old 'dark'/'light' values, default to 'dark'
    return ['dark', 'light', 'adaptive'].includes(saved) ? saved : 'light'
  })

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('nexus_theme', theme)

    // For adaptive: listen to system changes and update meta tag
    if (theme === 'adaptive') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('adaptive')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  const setAndSave = (next) => {
    setTheme(next)
    api.post('/theme', { theme: next }).catch(() => {})
  }

  // Convenience helpers
  const isDark = theme === 'dark' ||
    (theme === 'adaptive' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const isLight = theme === 'light' ||
    (theme === 'adaptive' && !window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme: setAndSave,
      toggle: () => setAndSave(theme === 'dark' ? 'light' : theme === 'light' ? 'adaptive' : 'dark'),
      isDark,
      isLight,
      isAdaptive: theme === 'adaptive',
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
