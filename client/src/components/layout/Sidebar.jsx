import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { setSidebarCollapsed } from '../../features/ui/uiSlice'

const NAV_ITEMS = {
  student: [
    { to: '/student/dashboard', icon: 'bi-house-door-fill', label: 'Dashboard' },
    { to: '/browse', icon: 'bi-compass-fill', label: 'Browse Courses' },
    { to: '/student/progress', icon: 'bi-graph-up-arrow', label: 'My Progress' },
  ],
  teacher: [
    { to: '/teacher/dashboard', icon: 'bi-house-door-fill', label: 'Dashboard' },
    { to: '/teacher/courses', icon: 'bi-book-fill', label: 'My Courses' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: 'bi-house-door-fill', label: 'Dashboard' },
    { to: '/admin/users', icon: 'bi-people-fill', label: 'Users' },
    { to: '/admin/courses', icon: 'bi-check-circle-fill', label: 'Approvals' },
    { to: '/admin/analytics', icon: 'bi-bar-chart-fill', label: 'Analytics' },
    { to: '/browse', icon: 'bi-compass-fill', label: 'Browse Courses' },
  ],
}

const Sidebar = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const { sidebarCollapsed, sidebarOpen } = useSelector((s) => s.ui)
  const items = NAV_ITEMS[user?.role] || []

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? '' : 'd-none d-md-block'}`}>
      {/* User info */}
      <div className={`py-4 border-bottom border-white border-opacity-10 ${sidebarCollapsed ? 'px-0 d-flex justify-content-center' : 'px-3'}`}>
        <div className={`d-flex align-items-center ${sidebarCollapsed ? 'justify-content-center' : 'gap-3'}`}>
          <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: 44, height: 44, fontSize: '1.1rem' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar-text overflow-hidden">
            <div className="fw-semibold text-white text-truncate" style={{ fontSize: '0.9rem' }}>{user?.name}</div>
            <span
              style={{
                fontSize: '0.65rem',
                background: 'rgba(255,255,255,0.15)',
                color: '#a8dadc',
                padding: '1px 8px',
                borderRadius: 20,
                display: 'inline-block',
                marginTop: 4,
                textTransform: 'capitalize',
                letterSpacing: '0.03em',
              }}
            >
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-2 px-2">
        {items.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            title={sidebarCollapsed ? label : undefined}
          >
            <i className={`bi ${icon}`} style={{ fontSize: '1.1rem', flexShrink: 0 }} />
            <span className="sidebar-text">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Collapse button */}
      {/* <div className="position-absolute bottom-0 w-100 border-top border-white border-opacity-10 p-2">
        <button
          className="btn btn-link text-white w-100 d-flex align-items-center justify-content-center"
          onClick={() => dispatch(setSidebarCollapsed(!sidebarCollapsed))}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`bi ${sidebarCollapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`} />

        </button>
      </div> */}
    </div>
  )
}
export default Sidebar
