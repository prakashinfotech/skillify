export const ROUTES = {
  HOME: '/',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:id',
  LOGIN: '/login',
  REGISTER: '/register',

  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_LESSON: '/student/courses/:courseId/lessons/:lessonId',
  STUDENT_QUIZ: '/student/courses/:courseId/quiz/:quizId',
  STUDENT_PROGRESS: '/student/progress',

  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_COURSES: '/teacher/courses',
  TEACHER_COURSE_NEW: '/teacher/courses/new',
  TEACHER_COURSE_EDIT: (id) => `/teacher/courses/${id}/edit`,
  TEACHER_LESSONS: (id) => `/teacher/courses/${id}/lessons`,
  TEACHER_QUIZZES: (id) => `/teacher/courses/${id}/quizzes`,
  TEACHER_QUIZ_NEW: (id) => `/teacher/courses/${id}/quizzes/new`,
  TEACHER_QUIZ_EDIT: (id, quizId) => `/teacher/courses/${id}/quizzes/${quizId}/edit`,
  TEACHER_PROGRESS: (id) => `/teacher/courses/${id}/progress`,

  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_ANALYTICS: '/admin/analytics',

  UNAUTHORIZED: '/unauthorized',
}
