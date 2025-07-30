import { QueryClient } from '@tanstack/react-query'

const disableRefetch = import.meta.env.MODE !== 'development'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: disableRefetch,
      refetchOnWindowFocus: disableRefetch,
    },
  },
})

export default queryClient
