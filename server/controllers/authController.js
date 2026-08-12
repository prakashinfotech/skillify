const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const asyncHandler = require('../utils/asyncHandler')
const { success, error } = require('../utils/apiResponse')
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens')
const sendEmail = require('../utils/sendEmail')

const GOOGLE_CALLBACK_URL = 'http://localhost:5000/api/v1/auth/google/callback'

const getGoogleClient = () => new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL
)

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
}

// POST /api/v1/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || !email || !password) {
    return error(res, 'Name, email and password are required', 400)
  }

  const existing = await User.findOne({ email })
  if (existing) {
    return error(res, 'Email already in use', 409)
  }

  const user = await User.create({ name, email, password, role })

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

  return success(
    res,
    {
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    },
    'Registered',
    201
  )
})

// POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return error(res, 'Email and password are required', 400)
  }

  const user = await User.findByEmail(email)
  if (!user) {
    return error(res, 'Invalid credentials', 401)
  }

  if (!user.isActive) {
    return error(res, 'your account is deactivate, please contact your administration', 401)
  }

  const match = await user.comparePassword(password)
  if (!match) {
    return error(res, 'Invalid credentials', 401)
  }

  user.lastLogin = new Date()

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

  return success(res, {
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  })
})

// POST /api/v1/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) {
    return error(res, 'No refresh token', 401)
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || user.refreshToken !== token || !user.isActive) {
    return error(res, 'Invalid refresh token', 401)
  }

  const accessToken = generateAccessToken(user._id)

  return success(res, { accessToken })
})

// POST /api/v1/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (token) {
    const user = await User.findById(req.user._id)
    if (user) {
      user.refreshToken = undefined
      await user.save({ validateBeforeSave: false })
    }
  }

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  })

  return success(res, {}, 'Logged out')
})

// GET /api/v1/auth/me
const getMe = asyncHandler(async (req, res) => {
  return success(res, { user: req.user })
})

// PUT /api/v1/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, avatar } = req.body

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, bio, avatar },
    { new: true, runValidators: true }
  ).select('-password -refreshToken')

  return success(res, { user })
})

// PUT /api/v1/auth/password
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return error(res, 'Current and new passwords are required', 400)
  }

  const user = await User.findById(req.user._id).select('+password')

  const match = await user.comparePassword(currentPassword)
  if (!match) {
    return error(res, 'Current password is incorrect', 400)
  }

  user.password = newPassword
  await user.save()

  return success(res, {}, 'Password updated')
})

// POST /api/v1/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return error(res, 'There is no user with that email', 404)
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken()
  await user.save({ validateBeforeSave: false })

  // Point to the FRONTEND reset page, not the API
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Reset Your Password</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:#1d3557;padding:32px 40px;text-align:center;">
                  <table cellpadding="0" cellspacing="0" align="center">
                    <tr>
                      <td style="padding-right:10px;">
                        <span style="font-size:32px;">🎓</span>
                      </td>
                      <td>
                        <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">Skillify</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 24px;">
                  <h2 style="margin:0 0 8px;font-size:22px;color:#1d3557;">Reset Your Password</h2>
                  <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                    Hi <strong>${user.name}</strong>,<br/>
                    We received a request to reset the password for your Skillify account associated with <strong>${user.email}</strong>.
                  </p>
                  <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
                    Click the button below to set a new password. This link will expire in <strong>10 minutes</strong>.
                  </p>

                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}"
                          style="display:inline-block;background:#1d3557;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:28px 0 0;font-size:13px;color:#999;line-height:1.6;">
                    If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding:0 40px;">
                  <hr style="border:none;border-top:1px solid #eee;" />
                </td>
              </tr>

              <!-- Link fallback -->
              <tr>
                <td style="padding:20px 40px;">
                  <p style="margin:0;font-size:12px;color:#aaa;line-height:1.7;">
                    If the button doesn't work, copy and paste this link into your browser:<br/>
                    <a href="${resetUrl}" style="color:#1d3557;word-break:break-all;">${resetUrl}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f4f6f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
                  <p style="margin:0;font-size:12px;color:#aaa;">
                    © ${new Date().getFullYear()} Skillify. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  try {
    await sendEmail({
      email: user.email,
      subject: 'Skillify – Password Reset Request',
      message: `Reset your password by visiting: ${resetUrl}`,
      html
    })

    return success(res, {}, 'Password reset email sent')
  } catch (err) {
    console.log(err)
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({ validateBeforeSave: false })
    return error(res, 'Email could not be sent', 500)
  }
})


// PUT /api/v1/auth/reset-password/:resettoken
const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })

  if (!user) {
    return error(res, 'Invalid or expired token', 400)
  }

  // Set new password
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  return success(res, {}, 'Password reset successful')
})

// GET /api/v1/auth/google
const googleAuth = asyncHandler(async (req, res) => {
  const client = getGoogleClient()
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    prompt: 'select_account',
  })
  res.redirect(url)
})

// GET /api/v1/auth/google/callback
const googleCallback = asyncHandler(async (req, res) => {
  const { code, error: oauthError } = req.query
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5175'

  if (oauthError || !code) {
    return res.redirect(`${clientUrl}/login?error=google_denied`)
  }

  const client = getGoogleClient()
  const { tokens } = await client.getToken(code)
  client.setCredentials(tokens)

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  const { email, name, picture } = ticket.getPayload()

  let user = await User.findOne({ email })

  if (!user) {
    user = await User.create({
      name,
      email,
      password: crypto.randomBytes(32).toString('hex'),
      avatar: picture || '',
      role: 'student',
    })
  } else {
    if (!user.avatar && picture) user.avatar = picture
  }

  if (!user.isActive) {
    return res.redirect(`${clientUrl}/login?error=account_deactivated`)
  }

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)
  user.refreshToken = refreshToken
  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

  const userInfo = encodeURIComponent(JSON.stringify({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  }))

  res.redirect(`${clientUrl}/auth/google/success?token=${accessToken}&user=${userInfo}`)
})

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
}
