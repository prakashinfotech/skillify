import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useGetMyCoursesQuery } from '../../services/courseApi'
import StatCard from '../../components/common/StatCard'
import Loader from '../../components/common/Loader'
import { formatDate } from '../../utils/formatters'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const statusVariant = {
  draft: 'secondary',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

const TeacherDashboard = () => {
  const { data, isLoading, isError } = useGetMyCoursesQuery()
  const courses = data?.data?.courses || data?.courses || []

  const totalCourses = courses.length
  const totalStudents = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0)
  const pendingApprovals = courses.filter((c) => c.status === 'pending').length
  const avgStudents = totalCourses > 0 ? (totalStudents / totalCourses).toFixed(1) : 0

  const chartData = {
    labels: courses.map((c) =>
      c.title.length > 20 ? c.title.substring(0, 20) + '…' : c.title
    ),
    datasets: [
      {
        label: 'Students Enrolled',
        data: courses.map((c) => c.enrollmentCount || 0),
        backgroundColor: 'rgba(29, 53, 87, 0.7)',
        borderColor: '#1d3557',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  }

  if (isLoading) return <Loader />
  if (isError)
    return (
      <div className="alert alert-danger">
        Failed to load dashboard data. Please try again.
      </div>
    )

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-primary, #1d3557)' }}>
            Teacher Dashboard
          </h3>
          <p className="text-muted mb-0">Welcome back! Here's what's happening with your courses.</p>
        </div>
        <Link to="/teacher/courses/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2" />
          Create Course
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Total Courses"
            value={totalCourses}
            icon="bi-book"
            variant="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon="bi-people"
            variant="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Pending Approval"
            value={pendingApprovals}
            icon="bi-clock"
            variant="warning"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Avg Students / Course"
            value={avgStudents}
            icon="bi-person-check"
            variant="info"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* My Courses Table */}
        <div className="col-xl-7">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex align-items-center justify-content-between py-3">
              <h5 className="mb-0 fw-semibold">My Courses</h5>
              <Link to="/teacher/courses" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body p-0">
              {courses.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-journal-x fs-1 d-block mb-2" />
                  No courses yet.{' '}
                  <Link to="/teacher/courses/new">Create your first course!</Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Course</th>
                        <th>Status</th>
                        <th className="text-center">Students</th>
                        <th className="text-center">Lessons</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.slice(0, 8).map((course) => (
                        <tr key={course._id}>
                          <td>
                            <div className="fw-semibold text-truncate" style={{ maxWidth: 180 }}>
                              {course.title}
                            </div>
                            <small className="text-muted">{formatDate(course.createdAt)}</small>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${statusVariant[course.status] || 'secondary'}`}
                            >
                              {course.status}
                            </span>
                          </td>
                          <td className="text-center">{course.enrollmentCount || 0}</td>
                          <td className="text-center">{course.lessonCount || 0}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Link
                                to={`/teacher/courses/${course._id}/edit`}
                                className="btn btn-sm btn-outline-primary"
                                title="Edit"
                              >
                                <i className="bi bi-pencil" />
                              </Link>
                              {/* <Link
                                to={`/teacher/courses/${course._id}/lessons`}
                                className="btn btn-sm btn-outline-secondary"
                                title="Manage Lessons"
                              >
                                <i className="bi bi-list-ol" />
                              </Link> */}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enrollment Chart */}
        <div className="col-xl-5">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-semibold">Student Enrollment</h5>
            </div>
            <div className="card-body">
              {courses.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-bar-chart fs-1 d-block mb-2" />
                  No data to display
                </div>
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats — Recent Activity */}
      <div className="row g-3 mt-2">
        {courses
          .filter((c) => c.status === 'pending')
          .slice(0, 3)
          .map((c) => (
            <div className="col-md-4" key={c._id}>
              <div className="alert alert-warning d-flex align-items-center mb-0">
                <i className="bi bi-hourglass-split me-2 fs-5" />
                <div>
                  <strong>{c.title}</strong> is awaiting admin approval.
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default TeacherDashboard
