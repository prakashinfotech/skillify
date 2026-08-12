const express = require('express')
const router = express.Router()

const adminController = require('../controllers/adminController')
const { verifyAccessToken } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')
const { ROLES } = require('../constants/roles')

// All admin routes require authentication and admin role
router.use(verifyAccessToken, authorize(ROLES.ADMIN))

router.get('/stats', adminController.getStats)
router.get('/pending-courses', adminController.getPendingCourses)
router.get('/enrollments-chart', adminController.getEnrollmentsChart)
router.get('/users-chart', adminController.getUsersChart)
router.get('/top-courses', adminController.getTopCourses)

module.exports = router
