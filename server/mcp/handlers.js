/**
 * MCP Tool Handlers
 * Each handler receives validated arguments and returns MCP-spec content blocks.
 */

const Course = require('../models/Course')
const User = require('../models/User')
const Enrollment = require('../models/Enrollment')
const Progress = require('../models/Progress')
const Lesson = require('../models/Lesson')
const Quiz = require('../models/Quiz')

const text = (str) => [{ type: 'text', text: typeof str === 'string' ? str : JSON.stringify(str, null, 2) }]

async function get_courses({ category, level, status, search, limit = 20 }) {
  const query = {}
  if (category) query.category = category
  if (level) query.level = level
  if (status) query.status = status
  else query.status = 'approved'
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
  ]

  const courses = await Course.find(query)
    .populate('teacher', 'name email')
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .lean()

  const summary = courses.map((c) => ({
    id: c._id,
    title: c.title,
    category: c.category,
    level: c.level,
    status: c.status,
    teacher: c.teacher?.name,
    tags: c.tags,
  }))

  return text({ count: summary.length, courses: summary })
}

async function get_course_detail({ courseId }) {
  const course = await Course.findById(courseId).populate('teacher', 'name email').lean()
  if (!course) return text({ error: 'Course not found' })

  const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 }).lean()
  const quizzes = await Quiz.find({ course: courseId }).lean()
  const enrollmentCount = await Enrollment.countDocuments({ course: courseId })

  return text({ course, lessons, quizzes, enrollmentCount })
}

async function get_users({ role, search, limit = 20 }) {
  const query = { isActive: true }
  if (role) query.role = role
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ]

  const users = await User.find(query)
    .select('-password -refreshToken -resetPasswordToken')
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .lean()

  return text({ count: users.length, users })
}

async function get_enrollments({ studentId, courseId, status, limit = 20 }) {
  const query = {}
  if (studentId) query.student = studentId
  if (courseId) query.course = courseId
  if (status) query.status = status

  const enrollments = await Enrollment.find(query)
    .populate('student', 'name email')
    .populate('course', 'title category')
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .lean()

  return text({ count: enrollments.length, enrollments })
}

async function get_student_progress({ studentId, courseId }) {
  const query = { student: studentId }
  if (courseId) query.course = courseId

  const records = await Progress.find(query)
    .populate('course', 'title category level')
    .populate('completedLessons', 'title')
    .lean()

  return text({ studentId, progressRecords: records })
}

async function get_analytics_summary() {
  const [totalUsers, totalCourses, totalEnrollments, completedEnrollments] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Course.countDocuments({ status: 'approved' }),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'completed' }),
  ])

  const usersByRole = await User.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ])

  const coursesByCategory = await Course.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ])

  return text({
    totalUsers,
    totalCourses,
    totalEnrollments,
    completionRate: totalEnrollments > 0
      ? `${Math.round((completedEnrollments / totalEnrollments) * 100)}%`
      : '0%',
    usersByRole: Object.fromEntries(usersByRole.map((r) => [r._id, r.count])),
    coursesByCategory: Object.fromEntries(coursesByCategory.map((r) => [r._id, r.count])),
  })
}

async function get_quiz_results({ studentId, quizId, passed, limit = 20 }) {
  const query = {}
  if (studentId) query.student = studentId
  if (quizId) query['quizAttempts.quiz'] = quizId
  if (passed !== undefined) query['quizAttempts.passed'] = passed

  const records = await Progress.find(query)
    .select('student quizAttempts')
    .populate('student', 'name email')
    .limit(Number(limit))
    .lean()

  const results = []
  for (const r of records) {
    for (const attempt of r.quizAttempts) {
      if (quizId && attempt.quiz.toString() !== quizId) continue
      if (passed !== undefined && attempt.passed !== passed) continue
      results.push({
        student: r.student,
        quiz: attempt.quiz,
        score: attempt.score,
        passed: attempt.passed,
        attemptedAt: attempt.attemptedAt,
      })
    }
  }

  return text({ count: results.length, results: results.slice(0, limit) })
}

async function search_content({ query, types = ['course', 'lesson', 'quiz'] }) {
  const regex = { $regex: query, $options: 'i' }
  const results = {}

  if (types.includes('course')) {
    results.courses = await Course.find({
      status: 'approved',
      $or: [{ title: regex }, { description: regex }, { tags: { $in: [new RegExp(query, 'i')] } }],
    }).select('title category level description').limit(10).lean()
  }

  if (types.includes('lesson')) {
    results.lessons = await Lesson.find({
      $or: [{ title: regex }, { content: regex }],
    }).select('title course').populate('course', 'title').limit(10).lean()
  }

  if (types.includes('quiz')) {
    results.quizzes = await Quiz.find({
      $or: [{ title: regex }],
    }).select('title course').populate('course', 'title').limit(10).lean()
  }

  return text(results)
}

const HANDLERS = {
  get_courses,
  get_course_detail,
  get_users,
  get_enrollments,
  get_student_progress,
  get_analytics_summary,
  get_quiz_results,
  search_content,
}

module.exports = { HANDLERS }
