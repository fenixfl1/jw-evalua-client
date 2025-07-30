import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { useAppContext } from 'src/context/AppContext'

const GuestGuard: React.FC = () => {
  const { isAuthenticated } = useAppContext()
  const location = useLocation()

  return (
    <ConditionalComponent
      condition={!isAuthenticated}
      fallback={<Navigate to={'/'} replace state={{ from: location }} />}
    >
      <Outlet />
    </ConditionalComponent>
  )
}

export default GuestGuard
