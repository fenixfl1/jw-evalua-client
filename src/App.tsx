import { RouterProvider } from 'react-router'
import router from './routes'
import { App as AntAppContext, ConfigProvider, theme, ThemeConfig } from 'antd'
import { defaultTheme } from 'src/config/theme'
import { useAppContext } from './context/AppContext'
import ErrorBoundary from './pages/global-error'
import moment from 'moment'
import dayjs from 'dayjs'
import 'moment/locale/es'
import 'dayjs/locale/es'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'styled-components'
import ConditionalComponent from './components/ConditionalComponent'
import Fallback from './components/Fallback'
import { NotificationProvider } from './context/NotificationContext'
import queryClient from './lib/query-client'
import { useState, useEffect } from 'react'
import { useLoadTheme } from './hooks/use-load-theme'
import Spanish from 'antd/lib/locale/es_ES'

moment.locale('es')
dayjs.locale('es')

const { defaultAlgorithm, darkAlgorithm, compactAlgorithm, defaultConfig } =
  theme

const algorithm = {
  light: [defaultAlgorithm, compactAlgorithm],
  dark: [darkAlgorithm, compactAlgorithm],
}

function App() {
  const { theme } = useAppContext()
  const [loadTheme] = useLoadTheme()
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>()

  useEffect(() => {
    loadTheme(theme).then((config) => {
      setThemeConfig({
        ...defaultConfig,
        ...config,
        algorithm: algorithm[theme],
      })
    })
  }, [theme])

  return (
    <ErrorBoundary>
      <ConditionalComponent condition={!!themeConfig} fallback={<Fallback />}>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider
            locale={Spanish}
            componentSize={'middle'}
            theme={{
              ...themeConfig,
              algorithm: algorithm[theme],
            }}
          >
            <ThemeProvider
              theme={{
                ...defaultTheme,
                ...themeConfig?.token,
                isDark: theme === 'dark',
              }}
            >
              <NotificationProvider>
                <AntAppContext>
                  <RouterProvider router={router()} />
                </AntAppContext>
              </NotificationProvider>
            </ThemeProvider>
          </ConfigProvider>
        </QueryClientProvider>
      </ConditionalComponent>
    </ErrorBoundary>
  )
}

export default App
