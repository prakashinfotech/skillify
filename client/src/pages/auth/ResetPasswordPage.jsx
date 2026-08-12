import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useResetPasswordMutation } from '../../services/authApi'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const getStrength = (pw) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^a-zA-Z0-9]/.test(pw)) score++
    return score
  }

  const strength = getStrength(password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'danger', 'warning', 'info', 'success'][strength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    if (password.length < 6) {
      setServerError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setServerError('Passwords do not match.')
      return
    }

    try {
      await resetPassword({ token, password }).unwrap()
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setServerError(err?.data?.message || 'This link is invalid or has expired.')
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
            Create a new password
          </h3>
          <p className="text-white-50" style={{ lineHeight: 1.7 }}>
            Choose a strong password to keep your account safe. We recommend using a mix of letters, numbers, and symbols.
          </p>
        </div>

        {/* Password tips */}
        <div className="card border-0 p-4 rounded-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <p className="fw-semibold text-white mb-3">Password tips</p>
          {[
            { icon: 'bi-check-circle', text: 'At least 8 characters' },
            { icon: 'bi-check-circle', text: 'One uppercase letter' },
            { icon: 'bi-check-circle', text: 'One number or symbol' },
          ].map((tip) => (
            <div key={tip.text} className="d-flex align-items-center gap-2 mb-1">
              <i className={`bi ${tip.icon} text-white-50`} />
              <span className="text-white-50 small">{tip.text}</span>
            </div>
          ))}
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

          {success ? (
            /* ── Success State ── */
            <div className="text-center">
              <div
                className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-4"
                style={{ width: 80, height: 80 }}
              >
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2rem' }} />
              </div>
              <h3 className="fw-bold mb-2">Password Reset!</h3>
              <p className="text-muted mb-4" style={{ lineHeight: 1.7 }}>
                Your password has been successfully updated. You'll be redirected to the login page in a moment.
              </p>
              <div className="progress mb-4" style={{ height: 4 }}>
                <div
                  className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                  style={{ width: '100%' }}
                />
              </div>
              <Link to="/login" className="btn btn-primary w-100 btn-lg">
                Go to Login
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
                  <i className="bi bi-lock-fill text-primary fs-4" />
                </div>
                <h3 className="fw-bold mb-1">Set New Password</h3>
                <p className="text-muted mb-0">
                  Your new password must be different from your previous password.
                </p>
              </div>

              {serverError && (
                <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill" />
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* New Password */}
                <div className="mb-3">
                  <label htmlFor="new-password" className="form-label fw-semibold">
                    New Password
                  </label>
                  <div className="input-group">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control form-control-lg"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password && (
                    <div className="mt-2">
                      <div className="d-flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((s) => (
                          <div
                            key={s}
                            className={`flex-grow-1 rounded`}
                            style={{
                              height: 4,
                              background: s <= strength ? `var(--bs-${strengthColor})` : '#e9ecef',
                              transition: 'background 0.3s',
                            }}
                          />
                        ))}
                      </div>
                      <small className={`text-${strengthColor}`}>{strengthLabel}</small>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label htmlFor="confirm-password" className="form-label fw-semibold">
                    Confirm Password
                  </label>
                  <div className="input-group">
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      className={`form-control form-control-lg ${
                        confirmPassword && confirmPassword !== password ? 'is-invalid' : ''
                      } ${confirmPassword && confirmPassword === password && password ? 'is-valid' : ''}`}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowConfirm((v) => !v)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                    {confirmPassword && confirmPassword !== password && (
                      <div className="invalid-feedback">Passwords do not match.</div>
                    )}
                    {confirmPassword && confirmPassword === password && password && (
                      <div className="valid-feedback">Passwords match!</div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 btn-lg mb-3"
                  disabled={isLoading || !password || !confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock me-2" />
                      Reset Password
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
