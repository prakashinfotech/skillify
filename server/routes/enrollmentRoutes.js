const express = require('express')
const router = express.Router()

const enrollmentController = require('../controllers/enrollmentController')
const { verifyAccessToken } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')
const { ROLES } = require('../constants/roles')

// IMPORTANT: /my and /course/:courseId must be defined before /:courseId

router.post('/', verifyAccessToken, authorize(ROLES.STUDENT), enrollmentController.enroll)

router.get('/my', verifyAccessToken, authorize(ROLES.STUDENT), enrollmentController.getMyEnrollments)

router.get(
  '/course/:courseId',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  enrollmentController.getCourseEnrollments
)

router.patch(
  '/course/:courseId/complete',
  verifyAccessToken,
  authorize(ROLES.STUDENT),
  enrollmentController.completeCourse
)

router.delete('/:courseId', verifyAccessToken, authorize(ROLES.STUDENT), enrollmentController.unenroll)

module.exports = router
