const jwt = require('jsonwebtoken')
const User = require('../models/User')
const asyncHandler = require('../utils/asyncHandler')

const verifyAccessToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  const user = await User.findById(decoded.id).select('-password -refreshToken')

  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' })
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account is deactivated' })
  }

  req.user = user
  next()
})

const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next()

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password -refreshToken')
    if (user && user.isActive) req.user = user
  } catch (err) {
    // Silent fail
  }
  next()
})

module.exports = { verifyAccessToken, optionalAuth }
