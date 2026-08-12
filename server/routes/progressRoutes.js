const express = require('express')
const router = express.Router()

const progressController = require('../controllers/progressController')
const { verifyAccessToken } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')
const { ROLES } = require('../constants/roles')

// IMPORTANT: /overview must be defined before /course/:courseId

router.get(
  '/overview',
  verifyAccessToken,
  authorize(ROLES.STUDENT),
  progressController.getProgressOverview
)

router.get(
  '/course/:courseId',
  verifyAccessToken,
  authorize(ROLES.STUDENT),
  progressController.getCourseProgress
)

router.get(
  '/course/:courseId/all',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  progressController.getAllStudentsProgress
)

router.get(
  '/student/:studentId/course/:courseId',
  verifyAccessToken,
  authorize(ROLES.ADMIN),
  progressController.getStudentProgress
)

module.exports = router
