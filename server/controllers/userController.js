const mongoose = require('mongoose')
const User = require('../models/User')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const Progress = require('../models/Progress')
const asyncHandler = require('../utils/asyncHandler')
const { success, error } = require('../utils/apiResponse')

// GET /api/v1/users
const getUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search, page = 1, limit = 10 } = req.query

  const filter = { _id: { $ne: req.user._id } }
  if (role) filter.role = role
  if (isActive !== undefined) filter.isActive = isActive === 'true'
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  }

  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(+limit)
      .sort({ createdAt: -1 }),
    User.countDocuments(filter)
  ])

  return success(res, {
    users,
    total,
    page: +page,
    pages: Math.ceil(total / limit)
  })
})

// GET /api/v1/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken')
  if (!user) return error(res, 'User not found', 404)

  return success(res, { user })
})

// PUT /api/v1/users/:id/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  ).select('-password -refreshToken')

  if (!user) return error(res, 'User not found', 404)

  return success(res, { user })
})

// DELETE /api/v1/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).select('-password -refreshToken')

  if (!user) return error(res, 'User not found', 404)

  return success(res, { message: 'User deactivated' })
})

// GET /api/v1/users/:id/stats
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.params.id

  const [coursesCreated, coursesEnrolled, quizAttempts] = await Promise.all([
    Course.countDocuments({ teacher: userId }),
    Enrollment.countDocuments({ student: userId }),
    Progress.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$quizAttempts' },
      { $count: 'total' }
    ])
  ])

  return success(res, {
    coursesCreated,
    coursesEnrolled,
    quizAttempts: quizAttempts[0]?.total || 0
  })
})

const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')

// GET /api/v1/users/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  return success(res, { user })
})

// PATCH /api/v1/users/update-me
const updateMe = asyncHandler(async (req, res) => {
  const { name, bio } = req.body
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, bio },
    { new: true, runValidators: true }
  )
  return success(res, { user }, 'Profile updated')
})

// POST /api/v1/users/request-email-update
const requestEmailUpdate = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) return error(res, 'New email is required', 400)

  // Check if email already exists
  const exists = await User.findOne({ email })
  if (exists) return error(res, 'Email already in use', 400)

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex')

  await User.findByIdAndUpdate(req.user._id, {
    pendingEmail: email,
    emailUpdateOTP: hashedOtp,
    emailUpdateExpire: Date.now() + 10 * 60 * 1000 // 10 mins
  })

  try {
    await sendEmail({
      email,
      subject: 'Email Update Verification',
      message: `Your verification code for updating email is: ${otp}. This code is valid for 10 minutes.`
    })
    return success(res, {}, 'Verification code sent to your new email')
  } catch (err) {
    await User.findByIdAndUpdate(req.user._id, {
      emailUpdateOTP: undefined,
      emailUpdateExpire: undefined,
      pendingEmail: undefined
    })
    return error(res, 'Email could not be sent', 500)
  }
})

// POST /api/v1/users/verify-email-update
const verifyEmailUpdate = asyncHandler(async (req, res) => {
  const { otp } = req.body
  if (!otp) return error(res, 'OTP is required', 400)

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex')
  const user = await User.findOne({
    _id: req.user._id,
    emailUpdateOTP: hashedOtp,
    emailUpdateExpire: { $gt: Date.now() }
  })

  if (!user) return error(res, 'Invalid or expired OTP', 400)

  user.email = user.pendingEmail
  user.pendingEmail = undefined
  user.emailUpdateOTP = undefined
  user.emailUpdateExpire = undefined
  await user.save()

  return success(res, { user }, 'Email updated successfully')
})

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUserStats,
  getMe,
  updateMe,
  requestEmailUpdate,
  verifyEmailUpdate
}
