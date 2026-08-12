const User = require('../models/User')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const Progress = require('../models/Progress')
const asyncHandler = require('../utils/asyncHandler')
const { success } = require('../utils/apiResponse')

const getStats = asyncHandler(async (req, res) => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    newUsersThisMonth,
    enrollmentsThisMonth,
    activeStudents,
    quizzesAttemptedResult,
    pendingCourses,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Course.countDocuments(),
    Enrollment.countDocuments({ status: 'active' }),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Enrollment.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Enrollment.distinct('student', { status: 'active' }),
    Progress.aggregate([{ $unwind: '$quizAttempts' }, { $count: 'total' }]),
    Course.countDocuments({ status: 'pending' }),
  ])

  return success(res, {
    totalUsers,
    totalCourses,
    totalEnrollments,
    activeStudents: activeStudents.length,
    quizzesAttempted: quizzesAttemptedResult[0]?.total || 0,
    newUsersThisMonth,
    enrollmentsThisMonth,
    pendingCourses,
  })
})

const getPendingCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ status: 'pending' })
    .populate('teacher', 'name email avatar')
    .sort({ createdAt: -1 })
  return success(res, { courses })
})

const getEnrollmentsChart = asyncHandler(async (req, res) => {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)
  twelveMonthsAgo.setHours(0, 0, 0, 0)

  const data = await Enrollment.aggregate([
    { $match: { createdAt: { $gte: twelveMonthsAgo } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ])
  return success(res, { chart: data })
})

const getUsersChart = asyncHandler(async (req, res) => {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)
  twelveMonthsAgo.setHours(0, 0, 0, 0)

  const data = await User.aggregate([
    { $match: { createdAt: { $gte: twelveMonthsAgo } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ])
  return success(res, { chart: data })
})

const getTopCourses = asyncHandler(async (req, res) => {
  const data = await Enrollment.aggregate([
    { $match: { status: { $in: ['active', 'completed'] } } },
    { $group: { _id: '$course', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
    { $unwind: '$course' },
    { $project: { count: 1, 'course.title': 1, 'course.thumbnail': 1, 'course.category': 1, 'course._id': 1 } },
  ])
  return success(res, { courses: data })
})

module.exports = { getStats, getPendingCourses, getEnrollmentsChart, getUsersChart, getTopCourses }
