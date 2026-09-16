import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export function useTheme() {
  const settings = useStore((s) => s.settings)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', settings.theme)
    root.setAttribute('data-font', settings.font)
    root.setAttribute('data-mode', settings.darkMode ? 'dark' : 'light')
  }, [settings.theme, settings.font, settings.darkMode])
}
