import React from 'react'

export const layoutMeta = { titleTemplate: 'JW Evalúa · %s' }

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <>{children}</>
}

export default RootLayout
