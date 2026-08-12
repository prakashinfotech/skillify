import { useSelector } from 'react-redux'
const useAuth = () => useSelector((s) => s.auth)
export default useAuth
