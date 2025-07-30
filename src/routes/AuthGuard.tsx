import { Navigate, Outlet, useLocation } from 'react-router'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { PATH_LOGIN } from 'src/constants/routes'
import { useAppContext } from 'src/context/AppContext'

const AuthGuard: React.FC = () => {
  const { isAuthenticated } = useAppContext()
  const location = useLocation()

  return (
    <ConditionalComponent
      condition={isAuthenticated}
      fallback={<Navigate to={PATH_LOGIN} replace state={{ from: location }} />}
    >
      <Outlet />
    </ConditionalComponent>
  )
}

export default AuthGuard
