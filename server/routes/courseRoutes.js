const express = require('express')
const router = express.Router()

const courseController = require('../controllers/courseController')
const { verifyAccessToken, optionalAuth } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')
const { validate } = require('../middleware/validateMiddleware')
const { createCourseValidator, updateCourseValidator } = require('../validators/courseValidator')
const { ROLES } = require('../constants/roles')

// IMPORTANT: specific path /teacher/mine must come before /:id
router.get(
  '/teacher/mine',
  verifyAccessToken,
  authorize(ROLES.TEACHER),
  courseController.getMyCourses
)

// Public routes (with optional auth for admin filtering)
router.get('/', optionalAuth, courseController.getCourses)
router.get('/:id', courseController.getCourseById)

// Protected routes
router.get('/:id/full', verifyAccessToken, courseController.getCourseFullDetail)

router.post(
  '/',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  createCourseValidator,
  validate,
  courseController.createCourse
)

router.put(
  '/:id/bulk-update',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  courseController.bulkUpdateCourse
)

router.put(
  '/:id',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  updateCourseValidator,
  validate,
  courseController.updateCourse
)

router.delete(
  '/:id',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  courseController.deleteCourse
)

router.patch(
  '/:id/submit',
  verifyAccessToken,
  authorize(ROLES.TEACHER),
  courseController.submitForApproval
)

router.patch(
  '/:id/approve',
  verifyAccessToken,
  authorize(ROLES.ADMIN),
  courseController.approveCourse
)

router.patch(
  '/:id/reject',
  verifyAccessToken,
  authorize(ROLES.ADMIN),
  courseController.rejectCourse
)

module.exports = router
