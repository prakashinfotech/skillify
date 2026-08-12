import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { useGetAdminStatsQuery, useGetEnrollmentsChartQuery, useGetUsersChartQuery, useGetTopCoursesQuery } from '../../services/adminApi'
import StatCard from '../../components/common/StatCard'
import Loader from '../../components/common/Loader'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const CHART_OPTIONS = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } },
}

const AdminDashboard = () => {
  const { data: statsData, isLoading: statsLoading } = useGetAdminStatsQuery()
  const { data: enrollData } = useGetEnrollmentsChartQuery()
  const { data: usersData } = useGetUsersChartQuery()
  const { data: topCoursesData } = useGetTopCoursesQuery()

  const stats = statsData?.data || {}
  const enrollChartRaw = enrollData?.data?.chart || []
  const usersChartRaw = usersData?.data?.chart || []
  const topCourses = topCoursesData?.data?.courses || []

  const enrollChart = {
    labels: enrollChartRaw.map((d) => d.month || d.label || ''),
    datasets: [{
      label: 'Enrollments',
      data: enrollChartRaw.map((d) => d.count || d.value || 0),
      borderColor: '#1d3557',
      backgroundColor: 'rgba(29,53,87,0.15)',
      tension: 0.4,
      fill: true,
    }],
  }

  const usersChart = {
    labels: usersChartRaw.map((d) => d.month || d.label || ''),
    datasets: [{
      label: 'New Users',
      data: usersChartRaw.map((d) => d.count || d.value || 0),
      backgroundColor: 'rgba(45,106,79,0.7)',
      borderColor: '#2d6a4f',
      borderRadius: 4,
    }],
  }

  if (statsLoading) return <Loader />

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#1d3557' }}>Admin Dashboard</h3>
          <p className="text-muted mb-0">Platform overview and analytics.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/courses" className="btn btn-outline-warning btn-sm">
            <i className="bi bi-clock me-1" />Pending Courses
          </Link>
          <Link to="/admin/analytics" className="btn btn-outline-primary btn-sm">
            <i className="bi bi-bar-chart me-1" />Analytics
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Total Users" value={stats.totalUsers ?? 0} icon="bi-people" variant="primary" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Total Courses" value={stats.totalCourses ?? 0} icon="bi-book" variant="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Enrollments" value={stats.totalEnrollments ?? 0} icon="bi-person-check" variant="info" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard title="Pending Approval" value={stats.pendingCourses ?? 0} icon="bi-hourglass-split" variant="warning" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-semibold">Monthly Enrollments</h5>
            </div>
            <div className="card-body">
              {enrollChartRaw.length === 0 ? (
                <div className="text-center text-muted py-4">No data</div>
              ) : (
                <Line data={enrollChart} options={{ ...CHART_OPTIONS, plugins: { legend: { display: false } } }} />
              )}
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-semibold">New Users Per Month</h5>
            </div>
            <div className="card-body">
              {usersChartRaw.length === 0 ? (
                <div className="text-center text-muted py-4">No data</div>
              ) : (
                <Bar data={usersChart} options={CHART_OPTIONS} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0 fw-semibold">Top Courses</h5>
          <Link to="/admin/courses" className="btn btn-sm btn-outline-primary">View All</Link>
        </div>
        <div className="card-body p-0">
          {topCourses.length === 0 ? (
            <div className="text-center text-muted py-4">No courses yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Course</th>
                    <th>Teacher</th>
                    <th className="text-center">Enrollments</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topCourses.slice(0, 5).map((course, idx) => (
                    <tr key={course._id}>
                      <td className="text-muted">{idx + 1}</td>
                      <td className="fw-semibold">{course.title}</td>
                      <td>{course.teacher?.name || '—'}</td>
                      <td className="text-center">{course.enrollmentCount ?? 0}</td>
                      <td>
                        <span className={`badge bg-${course.status === 'approved' ? 'success' : course.status === 'pending' ? 'warning' : 'secondary'}`}>
                          {course.status}
                        </span>
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
  )
}

export default AdminDashboard
