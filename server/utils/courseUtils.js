const Enrollment = require('../models/Enrollment')
const Progress = require('../models/Progress')
const Quiz = require('../models/Quiz')

/**
 * Checks if a course is fully completed by a student and updates enrollment status if so.
 */
const checkAndUpdateCourseCompletion = async (studentId, courseId) => {
  try {
    const [progress, quizCount] = await Promise.all([
      Progress.findOne({ student: studentId, course: courseId }),
      Quiz.countDocuments({ course: courseId })
    ])

    if (!progress) return false

    // Condition 1: 100% lessons complete
    const isLessonsComplete = progress.percentComplete >= 100

    // Condition 2: All quizzes passed
    const passedQuizIds = new Set(
      (progress.quizAttempts || [])
        .filter((a) => a.passed)
        .map((a) => a.quiz?.toString())
    )
    const isQuizzesComplete = quizCount === 0 || passedQuizIds.size >= quizCount

    if (isLessonsComplete && isQuizzesComplete) {
      await Enrollment.findOneAndUpdate(
        { student: studentId, course: courseId, status: 'active' },
        { status: 'completed', completedAt: new Date() }
      )
      return true
    }

    return false
  } catch (error) {
    console.error('Error updating course completion:', error)
    return false
  }
}

module.exports = { checkAndUpdateCourseCompletion }
