import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPasswordMutation } from '../../services/authApi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState('')
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    try {
      await forgotPassword({ email }).unwrap()
      setSent(true)
    } catch (err) {
      setServerError(err?.data?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="row g-0" style={{ minHeight: '100vh' }}>
      {/* Left Panel */}
      <div
        className="col-md-5 d-none d-md-flex flex-column justify-content-between py-5 px-5 text-white"
        style={{ background: '#1d3557' }}
      >
        <div>
          <div className="d-flex align-items-center gap-2 mb-5">
            <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '3rem' }} />
            <h2 className="fw-bold mb-0">Skillify</h2>
          </div>
          <h3 className="fw-bold mb-3" style={{ lineHeight: 1.4 }}>
            Forgot your password?
          </h3>
          <p className="text-white-50" style={{ lineHeight: 1.7 }}>
            No worries! Enter your registered email and we'll send you a secure link to reset your password within minutes.
          </p>
        </div>
        <div className="card border-0 p-4 rounded-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="d-flex align-items-center gap-3 mb-2">
            <i className="bi bi-shield-lock-fill text-white fs-4" />
            <strong className="text-white">Secure Reset</strong>
          </div>
          <p className="text-white-50 mb-0 small">
            Reset links are valid for 10 minutes and can only be used once for your security.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="col-md-7 d-flex align-items-center justify-content-center py-5 px-4 bg-white">
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile Logo */}
          <div className="d-flex d-md-none align-items-center gap-2 mb-4">
            <i className="bi bi-mortarboard-fill text-primary" style={{ fontSize: '2rem' }} />
            <span className="fw-bold fs-4">Skillify</span>
          </div>

          {sent ? (
            /* ── Success State ── */
            <div className="text-center">
              <div
                className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-4"
                style={{ width: 80, height: 80 }}
              >
                <i className="bi bi-envelope-check-fill text-success" style={{ fontSize: '2rem' }} />
              </div>
              <h3 className="fw-bold mb-2">Check your inbox</h3>
              <p className="text-muted mb-4" style={{ lineHeight: 1.7 }}>
                We've sent a password reset link to <strong>{email}</strong>. The link will expire in 10 minutes.
              </p>
              <div className="alert alert-info d-flex align-items-start gap-2 text-start" role="alert">
                <i className="bi bi-info-circle-fill mt-1 flex-shrink-0" />
                <span className="small">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    className="btn btn-link btn-sm p-0 align-baseline"
                    onClick={() => setSent(false)}
                  >
                    try again
                  </button>.
                </span>
              </div>
              <Link to="/login" className="btn btn-primary w-100 btn-lg mt-2">
                Back to Login
              </Link>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              <div className="mb-4">
                <div
                  className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 56, height: 56 }}
                >
                  <i className="bi bi-key-fill text-primary fs-4" />
                </div>
                <h3 className="fw-bold mb-1">Forgot Password</h3>
                <p className="text-muted mb-0">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {serverError && (
                <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill" />
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label htmlFor="reset-email" className="form-label fw-semibold">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 btn-lg mb-3"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2" />
                      Send Reset Link
                    </>
                  )}
                </button>

                <p className="text-center text-muted small mb-0">
                  Remember your password?{' '}
                  <Link to="/login" className="text-decoration-none fw-semibold">
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
