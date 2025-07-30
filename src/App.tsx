import { RouterProvider } from 'react-router'
import router from './routes'
import AppContextProvider from './context/AppContext'
import RootLayout from './pages/layout'
import ErrorBoundary from './pages/global-error'

function App() {
  return (
    <AppContextProvider>
      <ErrorBoundary>
        <RootLayout>
          <RouterProvider router={router()} />
        </RootLayout>
      </ErrorBoundary>
    </AppContextProvider>
  )
}

export default App
