import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from 'react-router'
import { publicRoutes, privateRoutes } from './auto-routes'
import { PATH_HOME } from 'src/constants/routes'
import AuthGuard from './AuthGuard'
import GuestGuard from './GuestGuard'
// import ErrorBoundary from 'src/pages/error'
import { PATH_DASHBOARD } from '../constants/routes'
import ErrorElement from 'src/pages/error'

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
          <Route path={PATH_HOME} element={<Navigate to={PATH_DASHBOARD} />} />
          <Route path={'/:activityId'}>
            {privateRoutes.map(({ path, loader, element }, key) => (
              <Route element={element} key={key} loader={loader} path={path} />
            ))}
          </Route>
        </Route>
      </Route>
    )
  )

export default router
