import useAuth from './useAuth'
const useRole = () => {
  const { user } = useAuth()
  return {
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    role: user?.role,
  }
}
export default useRole
