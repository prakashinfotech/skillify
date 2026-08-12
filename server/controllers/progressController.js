const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const Quiz = require('../models/Quiz')
const Progress = require('../models/Progress')
const asyncHandler = require('../utils/asyncHandler')
const { success, error } = require('../utils/apiResponse')

const getProgressOverview = asyncHandler(async (req, res) => {
  const progresses = await Progress.find({ student: req.user._id })
    .populate('course', 'title thumbnail category level slug')
    .populate('lastAccessedLesson', 'title _id order')

  const overview = await Promise.all(
    progresses.map(async (p) => {
      const [totalLessons, totalQuizzes] = await Promise.all([
        Lesson.countDocuments({ course: p.course._id, isPublished: true }),
        Quiz.countDocuments({ course: p.course._id }),
      ])
      const passedQuizzes = p.quizAttempts.filter((a) => a.passed).length
      return { ...p.toObject(), totalLessons, totalQuizzes, passedQuizzes }
    })
  )

  return success(res, { overview })
})

const getCourseProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({ student: req.user._id, course: req.params.courseId })
    .populate('completedLessons', 'title order duration')
    .populate('lastAccessedLesson', 'title _id order')

  if (!progress) {
    return success(res, { progress: { completedLessons: [], quizAttempts: [], percentComplete: 0 } })
  }
  return success(res, { progress })
})

const getAllStudentsProgress = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId)
  if (!course) return error(res, 'Course not found', 404)
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return error(res, 'Not authorized', 403)
  }

  const progresses = await Progress.find({ course: req.params.courseId })
    .populate('student', 'name email avatar')
    .populate('lastAccessedLesson', 'title order')
    .sort({ updatedAt: -1 })

  const enriched = await Promise.all(
    progresses.map(async (p) => {
      const [totalLessons, totalQuizzes] = await Promise.all([
        Lesson.countDocuments({ course: req.params.courseId, isPublished: true }),
        Quiz.countDocuments({ course: req.params.courseId }),
      ])
      const passedQuizzes = p.quizAttempts.filter((a) => a.passed).length
      
      // Check if course is fully completed (lessons + quizzes)
      const isFinished = p.percentComplete >= 100 && (totalQuizzes === 0 || passedQuizzes >= totalQuizzes)

      return {
        ...p.toObject(),
        totalLessons,
        totalQuizzes,
        passedQuizzes,
        isFinished
      }
    })
  )

  return success(res, { progresses: enriched })
})

const getStudentProgress = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.params
  const progress = await Progress.findOne({ student: studentId, course: courseId })
    .populate('student', 'name email avatar')
    .populate('completedLessons', 'title order duration')
    .populate('lastAccessedLesson', 'title order')

  if (!progress) return error(res, 'Progress not found', 404)
  return success(res, { progress })
})

module.exports = { getProgressOverview, getCourseProgress, getAllStudentsProgress, getStudentProgress }
