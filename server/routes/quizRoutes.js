const express = require('express')
const router = express.Router()

const quizController = require('../controllers/quizController')
const { verifyAccessToken } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')
const { validate } = require('../middleware/validateMiddleware')
const { createQuizValidator, updateQuizValidator } = require('../validators/quizValidator')
const { ROLES } = require('../constants/roles')

router.get('/course/:courseId', verifyAccessToken, quizController.getQuizzesByCourse)
router.get('/:id', verifyAccessToken, quizController.getQuizById)

router.post(
  '/',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  createQuizValidator,
  validate,
  quizController.createQuiz
)

router.put(
  '/:id',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  updateQuizValidator,
  validate,
  quizController.updateQuiz
)

router.delete(
  '/:id',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  quizController.deleteQuiz
)

router.post(
  '/:id/attempt',
  verifyAccessToken,
  authorize(ROLES.STUDENT),
  quizController.attemptQuiz
)

router.get(
  '/:id/results/:studentId',
  verifyAccessToken,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  quizController.getQuizResults
)

module.exports = router
