import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useGetLessonByIdQuery, useGetLessonsByCourseQuery, useCompleteLessonMutation } from '../../services/lessonApi'
import { useGetCourseProgressQuery, progressApi } from '../../services/progressApi'
import { enrollmentApi } from '../../services/enrollmentApi'
import LessonSidebar from '../../components/lesson/LessonSidebar'
import LessonContent from '../../components/lesson/LessonContent'
import Loader from '../../components/common/Loader'
import { useToast } from '../../hooks/useToast'

const StudentLesson = () => {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { showToast } = useToast()

  const { data: lessonData, isLoading: lessonLoading } = useGetLessonByIdQuery(lessonId)
  const { data: lessonsData, isLoading: listLoading } = useGetLessonsByCourseQuery(courseId)
  const { data: progressData } = useGetCourseProgressQuery(courseId)
  const [completeLesson, { isLoading: completing }] = useCompleteLessonMutation()

  const lesson = lessonData?.data?.lesson || lessonData?.data || lessonData
  const lessons = lessonsData?.data?.lessons || lessonsData?.data || []
  const progress = progressData?.data?.progress || {}
  const completedLessons = progress.completedLessons || []
  const completedSet = new Set(completedLessons.map((l) => l?._id?.toString?.() || l?.toString?.() || l))
  const percentComplete = progress.percentComplete ?? 0

  const currentIndex = lessons.findIndex((l) => l._id === lessonId)
  const isLastLesson = currentIndex >= 0 && currentIndex === lessons.length - 1
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  const handleComplete = async () => {
    if (completedSet.has(lessonId)) return
    try {
      await completeLesson(lessonId).unwrap()
      dispatch(progressApi.util.invalidateTags(['Progress']))
      dispatch(enrollmentApi.util.invalidateTags(['Enrollment']))
      showToast(isLastLesson ? 'Course complete! Great job!' : 'Lesson marked as complete!', 'success')
      setTimeout(() => {
        if (isLastLesson) {
          navigate('/student/dashboard')
        } else if (nextLesson) {
          navigate(`/student/courses/${courseId}/lessons/${nextLesson._id}`)
        }
      }, 1200)
    } catch (err) {
      showToast(err?.data?.message || 'Failed to mark complete', 'danger')
    }
  }

  if (lessonLoading || listLoading) return <Loader />
  if (!lesson) return <div className="alert alert-danger">Lesson not found.</div>

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div className="d-flex align-items-center px-3 py-2 border-bottom bg-white" style={{ flexShrink: 0, minHeight: 52 }}>
        <button
          className="btn btn-link text-decoration-none text-dark p-0 me-3 d-flex align-items-center gap-2"
          onClick={() => navigate('/student/dashboard')}
        >
          <i className="bi bi-arrow-left" />
          <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Dashboard</span>
        </button>
        <div className="vr mx-2" style={{ opacity: 0.2 }} />
        <span className="text-muted text-truncate" style={{ fontSize: '0.85rem' }}>{lesson.title}</span>
      </div>

      {/* Body */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        <div style={{ width: 280, flexShrink: 0, overflowY: 'auto' }}>
          <LessonSidebar
            lessons={lessons}
            currentLessonId={lessonId}
            completedLessons={completedLessons}
            courseId={courseId}
            percentComplete={percentComplete}
          />
        </div>

        <div className="flex-grow-1 overflow-auto p-4">
          <LessonContent lesson={lesson} />

          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <button
              className="btn btn-outline-secondary"
              disabled={!prevLesson}
              onClick={() => prevLesson && navigate(`/student/courses/${courseId}/lessons/${prevLesson._id}`)}
            >
              <i className="bi bi-chevron-left me-1" />Previous
            </button>

            <button
              className={`btn ${completedSet.has(lessonId) ? 'btn-success' : 'btn-primary'}`}
              onClick={handleComplete}
              disabled={completing || completedSet.has(lessonId)}
            >
              {completedSet.has(lessonId) ? (
                <><i className="bi bi-check-circle me-2" />Completed</>
              ) : completing ? (
                <><span className="spinner-border spinner-border-sm me-2" />Marking...</>
              ) : isLastLesson ? (
                'Complete Course'
              ) : (
                'Mark as Complete'
              )}
            </button>

            <button
              className="btn btn-outline-primary"
              disabled={!nextLesson}
              onClick={() => nextLesson && navigate(`/student/courses/${courseId}/lessons/${nextLesson._id}`)}
            >
              Next<i className="bi bi-chevron-right ms-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentLesson
