const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const { verifyAccessToken } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')
const { ROLES } = require('../constants/roles')

// All user routes require authentication
router.use(verifyAccessToken)

// Profile routes (Any authenticated user)
router.get('/me', userController.getMe)
router.patch('/update-me', userController.updateMe)
router.post('/request-email-update', userController.requestEmailUpdate)
router.post('/verify-email-update', userController.verifyEmailUpdate)

// User management routes (Admin only)
router.use(authorize(ROLES.ADMIN))
router.get('/', userController.getUsers)
router.get('/:id', userController.getUserById)
router.patch('/:id/status', userController.updateUserStatus)
router.delete('/:id', userController.deleteUser)
router.get('/:id/stats', userController.getUserStats)

module.exports = router
