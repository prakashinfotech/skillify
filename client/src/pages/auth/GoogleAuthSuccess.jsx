import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../../features/auth/authSlice'
import { useToast } from '../../hooks/useToast'
import Loader from '../../components/common/Loader'

const ERROR_MESSAGES = {
  google_denied: 'Google sign-in was cancelled.',
  account_deactivated: 'Your account has been deactivated. Please contact an administrator.',
}

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    const token = searchParams.get('token')
    const userParam = searchParams.get('user')
    const oauthError = searchParams.get('error')

    if (oauthError) {
      showToast(ERROR_MESSAGES[oauthError] || 'Google sign-in failed.', 'danger')
      navigate('/login')
      return
    }

    if (!token || !userParam) {
      navigate('/login')
      return
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam))
      dispatch(setCredentials({ user, accessToken: token }))
      showToast(`Welcome, ${user.name}!`, 'success')

      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true })
      else if (user.role === 'teacher') navigate('/teacher/dashboard', { replace: true })
      else navigate('/student/dashboard', { replace: true })
    } catch {
      navigate('/login')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <Loader fullScreen />
}

export default GoogleAuthSuccess
