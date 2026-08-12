import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import CourseProgressBar from '../course/CourseProgressBar'
import { useGetQuizzesByCourseQuery } from '../../services/quizApi'
import { useGetCourseProgressQuery } from '../../services/progressApi'

// Each quiz item manages its own modal state
const QuizSidebarItem = ({ quiz, courseId, isCurrentQuiz, isPassed }) => {
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const handleClick = (e) => {
    if (isPassed) {
      e.preventDefault()
      setShowModal(true)
    }
  }

  const handleConfirm = () => {
    setShowModal(false)
    navigate(`/student/courses/${courseId}/quiz/${quiz._id}`)
  }

  return (
    <>
      <Link
        to={`/student/courses/${courseId}/quiz/${quiz._id}`}
        className={`d-flex align-items-center gap-2 px-3 py-2 text-decoration-none ${
          isCurrentQuiz
            ? 'bg-warning bg-opacity-10 border-start border-3 border-warning'
            : 'border-start border-3 border-transparent'
        }`}
        style={{ color: 'inherit' }}
        onClick={handleClick}
      >
        <span
          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
            isCurrentQuiz ? 'bg-warning text-white' : isPassed ? 'bg-success text-white' : 'bg-light text-muted'
          }`}
          style={{ width: 24, height: 24, fontSize: '0.75rem', fontWeight: 700 }}
        >
          {isPassed ? (
            <i className="bi bi-check" style={{ fontSize: '0.7rem' }} />
          ) : (
            <i className="bi bi-patch-question-fill" style={{ fontSize: '1rem' }} />
          )}
        </span>
        <div>
          <p
            className={`mb-0 small ${
              isCurrentQuiz ? 'fw-semibold text-warning' : isPassed ? 'fw-semibold text-success' : ''
            }`}
            style={{ lineHeight: 1.3 }}
          >
            {quiz.title}
          </p>
          {isPassed && (
            <p className="mb-0 text-success" style={{ fontSize: '0.7rem' }}>Passed ✓</p>
          )}
        </div>
      </Link>

      {/* --- Retake confirmation modal (replaces window.confirm) --- */}
      {showModal && createPortal(
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999, backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4"
            style={{ maxWidth: 420, width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon + heading */}
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 52, height: 52 }}
              >
                <i className="bi bi-trophy-fill text-success" style={{ fontSize: '1.4rem' }} />
              </div>
              <div>
                <h6 className="fw-bold mb-0">Quiz Already Passed</h6>
                <p className="text-muted mb-0 small">You completed this quiz successfully</p>
              </div>
            </div>

            {/* Message */}
            <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
              You have already passed <strong>{quiz.title}</strong>. Would you like to re‑appear for this quiz?
            </p>

            {/* Action buttons */}
            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-outline-secondary btn-sm px-4"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm px-4"
                onClick={handleConfirm}
              >
                Yes, Retake
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

const LessonSidebar = ({ lessons = [], currentLessonId, completedLessons = [], courseId, percentComplete = 0 }) => {
  const completedIds = completedLessons.map((l) =>
    typeof l === 'object' ? l._id?.toString() : l?.toString()
  )
  const { data: quizzesData } = useGetQuizzesByCourseQuery(courseId, { skip: !courseId })
  const quizzes = quizzesData?.data?.quizzes || []
  const location = useLocation()

  const { data: progressData } = useGetCourseProgressQuery(courseId, { skip: !courseId })
  const passedQuizIds = new Set(
    (progressData?.data?.progress?.quizAttempts || [])
      .filter((a) => a.passed)
      .map((a) => a.quiz?.toString())
  )

  return (
    <div className="lesson-sidebar bg-white border-end" style={{ width: '100%' }}>
      <div className="p-3 border-bottom">
        <p className="small fw-semibold text-muted mb-2">Course Progress</p>
        <CourseProgressBar percentage={percentComplete} />
      </div>
      <div className="py-2">
        {/* Lessons list */}
        {lessons.map((lesson, idx) => {
          const isCompleted = completedIds.includes(lesson._id?.toString())
          const isCurrent = lesson._id?.toString() === currentLessonId?.toString()
          return (
            <Link
              key={lesson._id}
              to={`/student/courses/${courseId}/lessons/${lesson._id}`}
              className={`d-flex align-items-start gap-2 px-3 py-2 text-decoration-none ${
                isCurrent
                  ? 'bg-primary bg-opacity-10 border-start border-3 border-primary'
                  : 'border-start border-3 border-transparent'
              }`}
              style={{ color: 'inherit' }}
            >
              <span
                className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1 ${
                  isCompleted ? 'bg-success text-white' : isCurrent ? 'bg-primary text-white' : 'bg-light text-muted'
                }`}
                style={{ width: 24, height: 24, fontSize: '0.75rem', fontWeight: 700 }}
              >
                {isCompleted ? <i className="bi bi-check" style={{ fontSize: '0.7rem' }} /> : idx + 1}
              </span>
              <div>
                <p
                  className={`mb-0 small ${isCurrent ? 'fw-semibold text-primary' : ''}`}
                  style={{ lineHeight: 1.3 }}
                >
                  {lesson.title}
                </p>
                <p className="mb-0 text-muted" style={{ fontSize: '0.72rem' }}>{lesson.duration} min</p>
              </div>
            </Link>
          )
        })}

        {/* Quizzes list */}
        {quizzes.length > 0 && (
          <div className="mt-3 border-top pt-2">
            <p className="small fw-semibold text-muted px-3 mb-2">Quizzes</p>
            {quizzes.map((quiz) => {
              const isCurrentQuiz = location.pathname.includes(`/quiz/${quiz._id}`)
              const isPassed = passedQuizIds.has(quiz._id?.toString())
              return (
                <QuizSidebarItem
                  key={quiz._id}
                  quiz={quiz}
                  courseId={courseId}
                  isCurrentQuiz={isCurrentQuiz}
                  isPassed={isPassed}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonSidebar
