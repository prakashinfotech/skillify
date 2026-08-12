const express = require('express')
const rateLimit = require('express-rate-limit')
const router = express.Router()

const authController = require('../controllers/authController')
const { verifyAccessToken } = require('../middleware/authMiddleware')
const { validate } = require('../middleware/validateMiddleware')
const { registerValidator, loginValidator } = require('../validators/authValidator')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many requests, please try again later.' }
})

// Public routes
router.post('/register', registerValidator, validate, authController.register)
router.post('/login', loginValidator, validate, authLimiter, authController.login)
router.post('/refresh', authController.refresh)
router.post('/forgot-password', authController.forgotPassword)
router.put('/reset-password/:resettoken', authController.resetPassword)

// Google OAuth
router.get('/google', authController.googleAuth)
router.get('/google/callback', authController.googleCallback)

// Protected routes
router.post('/logout', verifyAccessToken, authController.logout)
router.get('/me', verifyAccessToken, authController.getMe)
router.put('/me/profile', verifyAccessToken, authController.updateProfile)
router.put('/me/password', verifyAccessToken, authController.updatePassword)

module.exports = router
