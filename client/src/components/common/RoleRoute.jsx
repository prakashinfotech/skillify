import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useSelector((s) => s.auth)
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <Outlet />
}
export default RoleRoute
