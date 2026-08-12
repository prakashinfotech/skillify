import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const UnauthorizedPage = () => {
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)

  const dashboardLink = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'teacher'
    ? '/teacher/dashboard'
    : '/student/dashboard'

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: '100vh', padding: '2rem' }}
    >
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger mb-4"
        style={{ width: 96, height: 96 }}
      >
        <i className="bi bi-shield-exclamation" style={{ fontSize: 40 }} />
      </div>
      <h1 className="fw-bold mb-2" style={{ color: '#1d3557' }}>Access Denied</h1>
      <p className="text-muted mb-4" style={{ maxWidth: 420 }}>
        You don't have permission to access this page. Please contact an administrator if you believe this is a mistake.
      </p>
      <div className="d-flex gap-2 flex-wrap justify-content-center">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2" />Go Back
        </button>
        {user ? (
          <Link to={dashboardLink} className="btn btn-primary">
            <i className="bi bi-house me-2" />My Dashboard
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary">
            <i className="bi bi-box-arrow-in-right me-2" />Sign In
          </Link>
        )}
      </div>
    </div>
  )
}

export default UnauthorizedPage
