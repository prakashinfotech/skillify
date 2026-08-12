import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { initializeAuth } from './features/auth/authSlice'

import ProtectedRoute from './components/common/ProtectedRoute'
import RoleRoute from './components/common/RoleRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import Loader from './components/common/Loader'

// Public pages
import HomePage from './pages/public/HomePage'
import CourseCatalogPage from './pages/public/CourseCatalogPage'
import CourseDetailPage from './pages/public/CourseDetailPage'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import GoogleAuthSuccess from './pages/auth/GoogleAuthSuccess'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import BrowseCoursesPage from './pages/student/BrowseCoursesPage'
import StudentLesson from './pages/student/StudentLesson'
import StudentQuiz from './pages/student/StudentQuiz'
import StudentProgress from './pages/student/StudentProgress'

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherCourses from './pages/teacher/TeacherCourses'
import TeacherCourseForm from './pages/teacher/TeacherCourseForm'
import TeacherLessons from './pages/teacher/TeacherLessons'
import TeacherQuizzes from './pages/teacher/TeacherQuizzes'
import TeacherQuizForm from './pages/teacher/TeacherQuizForm'
import TeacherProgress from './pages/teacher/TeacherProgress'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCourses from './pages/admin/AdminCourses'
import AdminAnalytics from './pages/admin/AdminAnalytics'

// User pages
import ProfilePage from './pages/user/ProfilePage'

// Misc
import UnauthorizedPage from './pages/misc/UnauthorizedPage'

const App = () => {
  const dispatch = useDispatch()
  const { isInitialized } = useSelector((s) => s.auth)

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  if (!isInitialized) return <Loader fullScreen />

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/courses" element={<CourseCatalogPage />} />
      <Route path="/courses/:id" element={<CourseDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected — all authenticated users */}
      <Route element={<ProtectedRoute />}>
        {/* Shared routes — accessible to all roles inside dashboard layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/browse" element={<BrowseCoursesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Student routes */}
        <Route element={<RoleRoute allowedRoles={['student']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/progress" element={<StudentProgress />} />
          </Route>
          <Route path="/student/courses/:courseId/lessons/:lessonId" element={<StudentLesson />} />
          <Route path="/student/courses/:courseId/quiz/:quizId" element={<StudentQuiz />} />
        </Route>

        {/* Teacher routes */}
        <Route element={<RoleRoute allowedRoles={['teacher']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/courses" element={<TeacherCourses />} />
            <Route path="/teacher/courses/new" element={<TeacherCourseForm />} />
            <Route path="/teacher/courses/:id/edit" element={<TeacherCourseForm />} />
            <Route path="/teacher/courses/:id/lessons" element={<TeacherLessons />} />
            <Route path="/teacher/courses/:id/quizzes" element={<TeacherQuizzes />} />
            <Route path="/teacher/courses/:id/quizzes/new" element={<TeacherQuizForm />} />
            <Route path="/teacher/courses/:id/quizzes/:quizId/edit" element={<TeacherQuizForm />} />
            <Route path="/teacher/courses/:id/progress" element={<TeacherProgress />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
