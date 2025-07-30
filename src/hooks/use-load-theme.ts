import { ThemeConfig } from 'antd'
import { useCallback, useState } from 'react'
import { Theme } from 'src/context/AppContext'

export function useLoadTheme(): [
  (theme: Theme) => Promise<ThemeConfig | null>,
  boolean,
  string | null
] {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTheme = useCallback(async (theme: Theme) => {
    setIsLoading(true)
    setError(null)

    try {
      const themeModule = await import(`../config/${theme}.theme.json`)
      return themeModule.default as ThemeConfig
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error cargando el tema:', error)
      setError(`No se pudo cargar el tema: ${theme}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return [loadTheme, isLoading, error]
}
