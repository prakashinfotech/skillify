import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { initializeAuth } from '../../features/auth/authSlice'
import Loader from './Loader'

const ProtectedRoute = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, isInitialized } = useSelector((s) => s.auth)

  useEffect(() => {
    if (!isInitialized) dispatch(initializeAuth())
  }, [dispatch, isInitialized])

  if (!isInitialized) return <Loader fullScreen />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}
export default ProtectedRoute
