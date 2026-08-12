import { useParams, Link } from 'react-router-dom'
import { useGetAllStudentsProgressQuery } from '../../services/progressApi'
import { useGetCourseByIdQuery } from '../../services/courseApi'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import CourseProgressBar from '../../components/course/CourseProgressBar'

const TeacherProgress = () => {
  const { id: courseId } = useParams()
  const { data: courseData } = useGetCourseByIdQuery(courseId)
  const { data, isLoading, isError } = useGetAllStudentsProgressQuery(courseId)


  
  const course = courseData?.data || courseData
  
  const students = data?.data?.progresses || []

  if (isLoading) return <Loader />

  if (isError) return <div className="alert alert-danger">Failed to load progress data.</div>

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div className="mb-1">
            <Link to="/teacher/courses" className="text-muted text-decoration-none small">
              <i className="bi bi-arrow-left me-1" />Courses
            </Link>
          </div>
          <h3 className="fw-bold mb-0" style={{ color: '#1d3557' }}>
            Student Progress — {course?.course?.title || 'Loading...'}
          </h3>
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon="bi-people"
          title="No students enrolled"
          description="Share your course to get students learning!"
        />
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th style={{ minWidth: 180 }}>Progress</th>
                    <th className="text-center">Lessons</th>
                    <th className="text-center">Quizzes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.student?._id || s._id}>
                      <td className="fw-semibold">{s.student?.name || '—'}</td>
                      <td className="text-muted small">{s.student?.email || '—'}</td>
                      <td><CourseProgressBar percent={s.percentComplete ?? 0} /></td>
                      <td className="text-center fw-semibold text-primary">{s.completedLessons?.length || 0} / {s.totalLessons || 0}</td>
                      <td className="text-center fw-semibold text-success">{s.passedQuizzes || 0} / {s.totalQuizzes || 0}</td>
                      <td>
                        {s.isFinished ? (
                          <span className="badge bg-success">Completed</span>
                        ) : (s.percentComplete ?? 0) > 0 ? (
                          <span className="badge bg-info">In Progress</span>
                        ) : (
                          <span className="badge bg-secondary">Not Started</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherProgress
