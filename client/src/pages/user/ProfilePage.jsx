import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  useUpdateMeMutation, 
  useRequestEmailUpdateMutation, 
  useVerifyEmailUpdateMutation 
} from '../../services/userApi'
import { setCredentials } from '../../features/auth/authSlice'
import { useToast } from '../../hooks/useToast'
import Loader from '../../components/common/Loader'

const ProfilePage = () => {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const { showToast } = useToast()

  const [updateMe, { isLoading: updatingProfile }] = useUpdateMeMutation()
  const [requestEmailUpdate, { isLoading: requestingOTP }] = useRequestEmailUpdateMutation()
  const [verifyEmailUpdate, { isLoading: verifyingOTP }] = useVerifyEmailUpdateMutation()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    email: user?.email || '',
  })

  const [newEmail, setNewEmail] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otp, setOtp] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        bio: user.bio || '',
        email: user.email,
      })
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await updateMe({ name: formData.name, bio: formData.bio }).unwrap()
      dispatch(setCredentials({ user: res.data.user }))
      showToast('Profile updated successfully', 'success')
    } catch (err) {
      showToast(err?.data?.message || 'Failed to update profile', 'danger')
    }
  }

  const handleEmailUpdateRequest = async (e) => {
    e.preventDefault()
    if (!newEmail || newEmail === user.email) {
      showToast('Please enter a different email address', 'warning')
      return
    }
    try {
      await requestEmailUpdate({ email: newEmail }).unwrap()
      setShowOtpInput(true)
      showToast('Verification code sent to ' + newEmail, 'info')
    } catch (err) {
      showToast(err?.data?.message || 'Failed to send verification code', 'danger')
    }
  }

  const handleOtpVerify = async (e) => {
    e.preventDefault()
    try {
      const res = await verifyEmailUpdate({ otp }).unwrap()
      dispatch(setCredentials({ user: res.data.user }))
      showToast('Email updated successfully', 'success')
      setShowOtpInput(false)
      setNewEmail('')
      setOtp('')
    } catch (err) {
      showToast(err?.data?.message || 'Invalid or expired OTP', 'danger')
    }
  }

  if (!user) return <Loader />

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">My Profile</h3>
            <p className="text-muted">Manage your account settings and profile information.</p>
          </div>

          {/* General Information */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-semibold">General Information</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleProfileSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Role</label>
                    <input type="text" className="form-control bg-light" value={user.role} disabled />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase">Bio</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us a bit about yourself..."
                    ></textarea>
                  </div>
                  <div className="col-12 mt-4">
                    <button type="submit" className="btn btn-primary px-4" disabled={updatingProfile}>
                      {updatingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Email Settings */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-semibold">Email Address</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-4 p-3 bg-light rounded">
                <div className="small fw-bold text-muted text-uppercase mb-1">Current Email</div>
                <div className="fw-semibold">{user.email}</div>
              </div>

              {!showOtpInput ? (
                <form onSubmit={handleEmailUpdateRequest}>
                  <label className="form-label small fw-bold text-muted text-uppercase">Update Email Address</label>
                  <div className="input-group">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter new email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                    <button className="btn btn-outline-primary px-4" type="submit" disabled={requestingOTP}>
                      {requestingOTP ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                  <div className="form-text mt-2">
                    A verification code will be sent to the new email address.
                  </div>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify}>
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2" />
                    Enter the 6-digit code sent to <strong>{newEmail}</strong>
                  </div>
                  <label className="form-label small fw-bold text-muted text-uppercase">Verification Code</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control text-center fw-bold"
                      style={{ letterSpacing: '8px' }}
                      maxLength="6"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                    <button className="btn btn-success px-4" type="submit" disabled={verifyingOTP}>
                      {verifyingOTP ? 'Verifying...' : 'Verify & Update'}
                    </button>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none"
                      onClick={() => setShowOtpInput(false)}
                    >
                      <i className="bi bi-arrow-left me-1" />
                      Back to email update
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
