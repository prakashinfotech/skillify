const express = require('express')
const router = express.Router()

const lessonController = require('../controllers/lessonController')
const { verifyAccessToken } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')
const { validate } = require('../middleware/validateMiddleware')
const { createLessonValidator, updateLessonValidator } = require('../validators/lessonValidator')
const { ROLES } = require('../constants/roles')

router.get('/course/:courseId', verifyAccessToken, lessonController.getLessonsByCourse)
router.get('/:id', verifyAccessToken, lessonController.getLessonById)

router.post(
  '/',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  createLessonValidator,
  validate,
  lessonController.createLesson
)

router.put(
  '/:id',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  updateLessonValidator,
  validate,
  lessonController.updateLesson
)

router.delete(
  '/:id',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  lessonController.deleteLesson
)

router.patch(
  '/:id/reorder',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  lessonController.reorderLesson
)

router.post(
  '/:id/complete',
  verifyAccessToken,
  authorize(ROLES.STUDENT),
  lessonController.completeLesson
)

module.exports = router
