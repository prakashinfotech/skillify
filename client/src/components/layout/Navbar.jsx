import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { clearCredentials } from '../../features/auth/authSlice'
import { setSidebarCollapsed } from '../../features/ui/uiSlice'
import { useLogoutMutation } from '../../services/authApi'
import { useGetAdminStatsQuery } from '../../services/adminApi'
import { getDashboardRoute } from '../../utils/formatters'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const { sidebarCollapsed } = useSelector((s) => s.ui)
  const [logout] = useLogoutMutation()
  const { data: statsData } = useGetAdminStatsQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'admin',
    pollingInterval: 30000 // Poll every 30s for new requests
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = async () => {
    setDropdownOpen(false)
    try { await logout().unwrap() } catch { /* ignore */ }
    dispatch(clearCredentials())
    navigate('/')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinkClass = ({ isActive }) =>
    `nav-link px-3 fw-semibold ${isActive ? 'text-primary border-bottom border-2 border-primary' : 'text-secondary'}`

  return (
    <nav className="navbar-custom d-flex align-items-center px-3 px-md-4 w-100" style={{ gap: 12 }}>
      {isAuthenticated && location.pathname !== '/' && (
        <button
          className="btn btn-link text-dark p-1 me-1 d-flex align-items-center"
          onClick={() => dispatch(setSidebarCollapsed(!sidebarCollapsed))}
          style={{ fontSize: '1.4rem' }}
        >
          <i className="bi bi-list" />
        </button>
      )}

      {/* Logo — always navigates to home */}
      <Link to="/" className="d-flex align-items-center text-decoration-none me-4" style={{ gap: 6 }}>
        <i className="bi bi-mortarboard-fill" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }} />
        <span className="fw-bold d-none d-sm-inline" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>Skillify</span>
      </Link>


      <div className="ms-auto d-flex align-items-center gap-2">
        {isAuthenticated && user ? (
          <>
            {user.role === 'admin' && (
              <Link
                to="/admin/courses"
                className="btn btn-link text-dark p-2 position-relative d-flex align-items-center justify-content-center"
                title="Pending Approvals"
                style={{ background: 'var(--color-bg-light)', borderRadius: '10px' }}
              >
                <i className="bi bi-bell" style={{ fontSize: '1.2rem' }} />
                {statsData?.data?.pendingCourses > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
                    style={{ fontSize: '0.65rem', padding: '0.25em 0.5em', marginTop: '5px', marginLeft: '-5px' }}
                  >
                    {statsData.data.pendingCourses}
                  </span>
                )}
              </Link>
            )}
            
            {/* User dropdown — pure React, no Bootstrap JS needed */}
            <div className="position-relative" ref={dropdownRef}>
              <button
                className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2"
                onClick={() => setDropdownOpen((o) => !o)}
              >
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: 36, height: 36, fontSize: '0.9rem', flexShrink: 0 }}
                >
                  {user.avatar
                    ? <img src={user.avatar} alt="" className="rounded-circle w-100 h-100" style={{ objectFit: 'cover' }} />
                    : user.name?.[0]?.toUpperCase()}
                </div>
                <div className="d-none d-md-block text-start">
                  <div className="fw-semibold text-dark" style={{ fontSize: '0.85rem', lineHeight: 1.2 }}>{user.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>{user.role}</div>
                </div>
                <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'} text-muted d-none d-md-block`} style={{ fontSize: '0.7rem' }} />
              </button>

              {dropdownOpen && (
                <div
                  className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border-0 py-1"
                  style={{ minWidth: 200, zIndex: 1050 }}
                >
                  {/* User info header */}
                  <div className="px-3 py-2 border-bottom">
                    <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{user.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user.email}</div>
                    <span className="badge bg-primary bg-opacity-10 text-primary mt-1" style={{ fontSize: '0.7rem' }}>
                      {user.role}
                    </span>
                  </div>

                  {/* Dashboard */}
                  <Link
                    className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark dropdown-item-hover"
                    style={{ fontSize: '0.875rem' }}
                    to={getDashboardRoute(user.role)}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-speedometer2 text-primary" />My Dashboard
                  </Link>

                  <Link
                    className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark dropdown-item-hover"
                    style={{ fontSize: '0.875rem' }}
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-person-circle text-primary" />My Profile
                  </Link>

                  <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />

                  {/* Logout */}
                  <button
                    className="d-flex align-items-center gap-2 w-100 px-3 py-2 border-0 bg-transparent text-danger dropdown-item-hover"
                    style={{ fontSize: '0.875rem', cursor: 'pointer' }}
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right" />Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) :(
          <>
            <Link to="/login" className="btn btn-outline-primary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
export default Navbar
