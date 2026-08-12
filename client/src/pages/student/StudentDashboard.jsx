import { Link } from 'react-router-dom'
import { useGetMyEnrollmentsQuery } from '../../services/enrollmentApi'
import { useGetProgressOverviewQuery } from '../../services/progressApi'
import StatCard from '../../components/common/StatCard'
import Loader from '../../components/common/Loader'
import CourseProgressBar from '../../components/course/CourseProgressBar'
import EmptyState from '../../components/common/EmptyState'

const StudentDashboard = () => {
  const { data: enrollData, isLoading: enrollLoading } = useGetMyEnrollmentsQuery()
  const { data: progressData, isLoading: progressLoading } = useGetProgressOverviewQuery()

  
  const enrollments = enrollData?.data?.enrollments || []
  const overviewArray = progressData?.data?.overview || []

  const totalCourses = enrollments.length
  const completedCourses = enrollments.filter((e) => 
    e.status === 'completed' || 
    ((e.progressPercent ?? e.progress?.percentComplete ?? 0) >= 100 && (e.quizCount === 0 || e.passedQuizCount >= e.quizCount))
  ).length
  const inProgress = totalCourses - completedCourses
  const avgProgress = overviewArray.length > 0 
    ? overviewArray.reduce((acc, p) => acc + (p.percentComplete || 0), 0) / overviewArray.length 
    : 0

  if (enrollLoading || progressLoading) return <Loader />

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: '#1d3557' }}>My Learning</h3>
        <p className="text-muted mb-0">Track your progress and continue where you left off.</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Enrolled Courses" value={totalCourses} icon="bi-book" variant="primary" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="In Progress" value={inProgress} icon="bi-play-circle" variant="info" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Completed" value={completedCourses} icon="bi-trophy" variant="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Avg Progress" value={`${Math.round(avgProgress)}%`} icon="bi-graph-up" variant="warning" />
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex align-items-center justify-content-between py-3">
          <h5 className="mb-0 fw-semibold">My Courses</h5>
          <Link to="/courses" className="btn btn-sm btn-outline-primary">Browse More</Link>
        </div>
        <div className="card-body">
          {enrollments.length === 0 ? (
            <EmptyState
              icon="bi-journal-x"
              title="No courses yet"
              description="You haven't enrolled in any courses. Browse the catalog to get started!"
              actionLabel="Browse Courses"
              actionTo="/courses"
            />
          ) : (
            <div className="row g-3">
              {enrollments.map((enrollment) => {
                const course = enrollment.course || {}
                const progress = enrollment.progressPercent ?? enrollment.progress?.percentComplete ?? 0
                const firstLessonId = enrollment.firstLessonId
                const lastLesson = enrollment.progress?.lastAccessedLesson
                const completedLessons = enrollment.progress?.completedLessons || []
                const resumeLesson = lastLesson || firstLessonId || (completedLessons.length > 0 ? completedLessons[0] : null)
                return (
                  <div className="col-md-6 col-xl-4" key={enrollment._id}>
                    <div className="card h-100 border-0 shadow-sm">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="card-img-top"
                          style={{ height: 120, objectFit: 'cover', borderRadius: '10px 10px 0 0' }}
                        />
                      )}
                      <div className="card-body">
                        <div className="d-flex align-items-start justify-content-between mb-1">
                          <h6 className="fw-semibold mb-0 text-truncate" style={{ maxWidth: '75%' }}>{course.title}</h6>
                          <span className="badge bg-primary bg-opacity-10 text-primary ms-1" style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                            {course.category}
                          </span>
                        </div>
                        <p className="text-muted small mb-2">
                          {enrollment.lessonCount ?? 0} lesson{enrollment.lessonCount !== 1 ? 's' : ''}
                        </p>
                        <CourseProgressBar percent={progress} />
                        <div className="mt-3">
                          {(() => {
                            const isFinished = progress >= 100 && (enrollment.quizCount === 0 || enrollment.passedQuizCount >= enrollment.quizCount);
                            
                            if (isFinished) {
                              return (
                                <Link 
                                  to={`/student/courses/${course._id}/lessons/${resumeLesson || firstLessonId}`} 
                                  className="btn btn-sm btn-success w-100"
                                >
                                  <i className="bi bi-check-all me-1" />
                                  Completed
                                </Link>
                              );
                            }

                            if (resumeLesson) {
                              return (
                                <Link
                                  to={`/student/courses/${course._id}/lessons/${resumeLesson}`}
                                  className="btn btn-sm btn-primary w-100"
                                >
                                  <i className={`bi ${progress > 0 ? 'bi-play-fill' : 'bi-play'} me-1`} />
                                  {progress > 0 ? 'Continue Learning' : 'Start Course'}
                                </Link>
                              );
                            }

                            return (
                              <Link
                                to={`/courses/${course._id}`}
                                className="btn btn-sm btn-outline-secondary w-100"
                              >
                                <i className="bi bi-info-circle me-1" />View Course
                              </Link>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
