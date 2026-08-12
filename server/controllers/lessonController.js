const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const Enrollment = require('../models/Enrollment')
const Progress = require('../models/Progress')
const asyncHandler = require('../utils/asyncHandler')
const { success, error } = require('../utils/apiResponse')
const { checkAndUpdateCourseCompletion } = require('../utils/courseUtils')

// GET /api/v1/courses/:courseId/lessons
const getLessonsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params

  const course = await Course.findById(courseId)
  if (!course) return error(res, 'Course not found', 404)

  const isOwner = course.teacher.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    })
    if (!enrollment) return error(res, 'Not enrolled', 403)
  }

  const lessons = await Lesson.find({ course: courseId, isPublished: true }).sort({ order: 1 })

  return success(res, { lessons })
})

// GET /api/v1/lessons/:id
const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate('course', 'title teacher')
  if (!lesson) return error(res, 'Lesson not found', 404)

  const isOwner = lesson.course.teacher.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course._id,
      status: { $in: ['active', 'completed'] }
    })
    if (!enrollment) return error(res, 'Not enrolled', 403)
  }

  return success(res, { lesson })
})

// POST /api/v1/lessons
const createLesson = asyncHandler(async (req, res) => {
  const { course: courseId } = req.body

  const course = await Course.findById(courseId)
  if (!course) return error(res, 'Course not found', 404)

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return error(res, 'Not authorized', 403)
  }

  const lesson = await Lesson.create(req.body)

  return success(res, { lesson }, 'Lesson created', 201)
})

// PUT /api/v1/lessons/:id
const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate('course', 'teacher')
  if (!lesson) return error(res, 'Lesson not found', 404)

  if (lesson.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return error(res, 'Not authorized', 403)
  }

  const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true })

  return success(res, { lesson: updated })
})

// DELETE /api/v1/lessons/:id
const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate('course', 'teacher')
  if (!lesson) return error(res, 'Lesson not found', 404)

  if (lesson.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return error(res, 'Not authorized', 403)
  }

  await Lesson.findByIdAndDelete(req.params.id)

  return success(res, {}, 'Lesson deleted')
})

// PUT /api/v1/lessons/:id/reorder
const reorderLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    { order: req.body.order },
    { new: true }
  )

  if (!lesson) return error(res, 'Lesson not found', 404)

  return success(res, { lesson })
})

// POST /api/v1/lessons/:id/complete
const completeLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate('course', '_id')
  if (!lesson) return error(res, 'Lesson not found', 404)

  const courseId = lesson.course._id

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
    status: { $in: ['active', 'completed'] }
  })
  if (!enrollment) return error(res, 'Not enrolled', 403)

  let progress = await Progress.findOne({ student: req.user._id, course: courseId })
  if (!progress) {
    progress = await Progress.create({ student: req.user._id, course: courseId })
  }

  if (!progress.completedLessons.includes(req.params.id)) {
    progress.completedLessons.push(req.params.id)
  }

  progress.lastAccessedLesson = req.params.id

  const totalLessons = await Lesson.countDocuments({ course: courseId, isPublished: true })
  progress.percentComplete =
    totalLessons > 0 ? Math.round((progress.completedLessons.length / totalLessons) * 100) : 0

  await progress.save()

  // Automatically check and update enrollment status if course is finished
  const isNowComplete = await checkAndUpdateCourseCompletion(req.user._id, courseId)

  return success(res, { progress, isNowComplete })
})

module.exports = {
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLesson,
  completeLesson
}
