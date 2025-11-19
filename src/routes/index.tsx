import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from 'react-router'
import { publicRoutes, privateRoutes, operatorRoutes } from './auto-routes'
import { PATH_HOME } from 'src/constants/routes'
import AuthGuard from './AuthGuard'
import GuestGuard from './GuestGuard'
import ErrorElement from 'src/pages/error'
import { getSessionInfo } from 'src/lib/session'
import { getHomePathByRole } from 'src/utils/get-home-path'

const RoleHomeRedirect = () => {
  const { roleId } = getSessionInfo() ?? {}
  const target = getHomePathByRole(roleId)

  return <Navigate replace to={target} />
}

const router = () =>
  createBrowserRouter(
    createRoutesFromElements(
      <Route errorElement={<ErrorElement />}>
        <Route element={<GuestGuard />}>
          {publicRoutes.map(({ path, loader, element }, key) => (
            <Route element={element} key={key} loader={loader} path={path} />
          ))}
        </Route>

        <Route element={<AuthGuard />}>
          <Route path={PATH_HOME} element={<RoleHomeRedirect />} />
          <Route path={'/:activityId'}>
            {privateRoutes.map(({ path, loader, element }, key) => (
              <Route element={element} key={key} loader={loader} path={path} />
            ))}
          </Route>
          {operatorRoutes.map(({ path, loader, element }, key) => (
            <Route element={element} key={key} loader={loader} path={path} />
          ))}
        </Route>
      </Route>
    )
  )

export default router
