const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const Enrollment = require('../models/Enrollment')
const Progress = require('../models/Progress')
const Quiz = require('../models/Quiz')
const asyncHandler = require('../utils/asyncHandler')
const { success, error } = require('../utils/apiResponse')

const enroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body
  const course = await Course.findById(courseId)
  if (!course) return error(res, 'Course not found', 404)
  if (course.status !== 'approved') return error(res, 'Course is not available for enrollment', 400)

  const existing = await Enrollment.findOne({ student: req.user._id, course: courseId })
  if (existing && existing.status === 'active') return error(res, 'Already enrolled in this course', 409)

  // Prerequisite check
  if (course.prerequisites && course.prerequisites.length > 0) {
    const completions = await Enrollment.find({
      student: req.user._id,
      course: { $in: course.prerequisites },
      status: 'completed'
    }).populate('course', 'title')

    if (completions.length < course.prerequisites.length) {
      const completedIds = completions.map(c => c.course._id.toString())
      const missingIds = course.prerequisites.filter(pId => !completedIds.includes(pId.toString()))
      
      // Fetch missing course titles if not already available
      const missingCourses = await Course.find({ _id: { $in: missingIds } }, 'title')
      const missingTitles = missingCourses.map(c => c.title).join(', ')
      
      return error(res, `You must complete the following course(s) before enrolling: ${missingTitles}`, 403)
    }
  }

  let enrollment
  if (existing) {
    existing.status = 'active'
    enrollment = await existing.save()
  } else {
    enrollment = await Enrollment.create({ student: req.user._id, course: courseId })
    await Progress.findOneAndUpdate(
      { student: req.user._id, course: courseId },
      { student: req.user._id, course: courseId },
      { upsert: true, new: true }
    )
  }

  return success(res, { enrollment }, 'Enrolled successfully', 201)
})

const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: 'course',
      populate: { path: 'teacher', select: 'name avatar' },
      select: 'title thumbnail category level totalDuration slug',
    })
    .sort({ createdAt: -1 })

  const enriched = await Promise.all(
    enrollments.map(async (e) => {
      const [progress, lessonCount, firstLesson, quizCount] = await Promise.all([
        Progress.findOne({ student: req.user._id, course: e.course._id }),
        Lesson.countDocuments({ course: e.course._id, isPublished: true }),
        Lesson.findOne({ course: e.course._id, isPublished: true }).sort({ order: 1 }).select('_id'),
        Quiz.countDocuments({ course: e.course._id }),
      ])

      const passedQuizIds = new Set(
        (progress?.quizAttempts || [])
          .filter((a) => a.passed)
          .map((a) => a.quiz?.toString())
      )

      return {
        ...e.toObject(),
        progressPercent: progress?.percentComplete || 0,
        progress: {
          percentComplete: progress?.percentComplete || 0,
          completedLessons: (progress?.completedLessons || []).map((l) => l.toString()),
          lastAccessedLesson: progress?.lastAccessedLesson?.toString() || null,
          passedQuizCount: passedQuizIds.size,
          quizCount: quizCount,
        },
        lessonCount,
        quizCount,
        passedQuizCount: passedQuizIds.size,
        firstLessonId: firstLesson?._id?.toString() || null,
      }
    })
  )

  return success(res, { enrollments: enriched })
})

const unenroll = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId })
  if (!enrollment) return error(res, 'Enrollment not found', 404)
  enrollment.status = 'dropped'
  await enrollment.save()
  return success(res, {}, 'Unenrolled successfully')
})

const getCourseEnrollments = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId)
  if (!course) return error(res, 'Course not found', 404)
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return error(res, 'Not authorized', 403)
  }

  const enrollments = await Enrollment.find({ course: req.params.courseId, status: 'active' })
    .populate('student', 'name email avatar createdAt')
    .sort({ createdAt: -1 })

  const withProgress = await Promise.all(
    enrollments.map(async (e) => {
      const progress = await Progress.findOne({ student: e.student._id, course: req.params.courseId })
      return { ...e.toObject(), progress }
    })
  )

  return success(res, { enrollments: withProgress })
})

const completeCourse = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOneAndUpdate(
    { student: req.user._id, course: req.params.courseId },
    { status: 'completed', completedAt: new Date() },
    { new: true }
  )
  if (!enrollment) return error(res, 'Enrollment not found', 404)
  return success(res, { enrollment })
})

module.exports = { enroll, getMyEnrollments, unenroll, getCourseEnrollments, completeCourse }
