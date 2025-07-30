import React, { useEffect, useState } from 'react'
import { App, ConfigProvider, theme, ThemeConfig } from 'antd'
// import { useResponsive } from 'antd-style'
import { RouterProvider } from 'react-router'
import { defaultTheme } from 'src/config/theme'
import { useAppContext } from 'src/context/AppContext'
import router from 'src/routes'
import Spanish from 'antd/lib/locale/es_ES'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'styled-components'
import { useLoadTheme } from 'src/hooks/use-load-theme'
import ConditionalComponent from 'src/components/ConditionalComponent'
import Fallback from 'src/components/Fallback'
import queryClient from 'src/lib/query-client'
import { NotificationProvider } from 'src/context/NotificationContext'

const { defaultAlgorithm, darkAlgorithm, compactAlgorithm, defaultConfig } =
  theme

const algorithm = {
  light: [defaultAlgorithm, compactAlgorithm],
  dark: [darkAlgorithm, compactAlgorithm],
}

const RootLayout: React.FC<React.PropsWithChildren> = () => {
  // const { xxl } = useResponsive()
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
              <App>
                <RouterProvider router={router()} />
              </App>
            </NotificationProvider>
          </ThemeProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </ConditionalComponent>
  )
}

export default RootLayout
