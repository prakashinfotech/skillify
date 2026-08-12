import { useGetProgressOverviewQuery } from '../../services/progressApi'
import { useGetMyEnrollmentsQuery } from '../../services/enrollmentApi'
import Loader from '../../components/common/Loader'
import CourseProgressBar from '../../components/course/CourseProgressBar'
import EmptyState from '../../components/common/EmptyState'

const StudentProgress = () => {
  const { data: overviewData, isLoading: overviewLoading } = useGetProgressOverviewQuery()
  const { data: enrollData, isLoading: enrollLoading } = useGetMyEnrollmentsQuery()
  
  const overviewArray = overviewData?.data?.overview || []
  const enrollments = enrollData?.data?.enrollments || []

  if (overviewLoading || enrollLoading) return <Loader />

  const totalLessons = overviewArray.reduce((acc, p) => acc + (p.totalLessons || 0), 0)
  const completedLessons = overviewArray.reduce((acc, p) => acc + (p.completedLessons?.length || 0), 0)
  const avgProgress = overviewArray.length > 0 
    ? overviewArray.reduce((acc, p) => acc + (p.percentComplete || 0), 0) / overviewArray.length 
    : 0

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: '#1d3557' }}>My Progress</h3>
        <p className="text-muted mb-0">Overview of all your learning activity.</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="card shadow-sm text-center py-4">
            <div className="display-6 fw-bold text-primary">{completedLessons}</div>
            <div className="text-muted small">Lessons Completed</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card shadow-sm text-center py-4">
            <div className="display-6 fw-bold text-success">{totalLessons}</div>
            <div className="text-muted small">Total Lessons</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card shadow-sm text-center py-4">
            <div className="display-6 fw-bold text-warning">{Math.round(avgProgress)}%</div>
            <div className="text-muted small">Average Progress</div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">Course Breakdown</h5>
        </div>
        <div className="card-body">
          {enrollments.length === 0 ? (
            <EmptyState icon="bi-bar-chart" title="No data yet" description="Enroll in a course and start learning!" actionLabel="Browse Courses" actionTo="/courses" />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Course</th>
                    <th>Category</th>
                    <th style={{ minWidth: 160 }}>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => {
                    const course = enrollment.course || {}
                    const progress = enrollment.progressPercent ?? 0
                    const completed = enrollment.status === 'completed'
                    return (
                      <tr key={enrollment._id}>
                        <td className="fw-semibold">{course.title}</td>
                        <td><span className="badge bg-secondary">{course.category}</span></td>
                        <td>
                          <CourseProgressBar percent={progress} />
                        </td>
                        <td>
                          {(() => {
                            const isFinished = enrollment.status === 'completed' || 
                              (progress >= 100 && (enrollment.quizCount === 0 || enrollment.passedQuizCount >= enrollment.quizCount));
                            
                            if (isFinished) return <span className="badge bg-success">Completed</span>;
                            if (progress > 0) return <span className="badge bg-info">In Progress</span>;
                            return <span className="badge bg-secondary">Not Started</span>;
                          })()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentProgress
