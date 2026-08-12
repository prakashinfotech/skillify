import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { useGetEnrollmentsChartQuery, useGetUsersChartQuery, useGetAdminStatsQuery, useGetTopCoursesQuery } from '../../services/adminApi'
import Loader from '../../components/common/Loader'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

const BASE_OPTIONS = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } },
}

const AdminAnalytics = () => {
  const { data: statsData, isLoading } = useGetAdminStatsQuery()
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
      backgroundColor: 'rgba(29,53,87,0.12)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
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

  const topCoursesChart = {
    labels: topCourses.slice(0, 6).map((c) => c.title?.length > 18 ? c.title.substring(0, 18) + '…' : c.title),
    datasets: [{
      data: topCourses.slice(0, 6).map((c) => c.enrollmentCount || 0),
      backgroundColor: ['#1d3557', '#2d6a4f', '#e63946', '#457b9d', '#a8dadc', '#f4a261'],
    }],
  }

  if (isLoading) return <Loader />

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: '#1d3557' }}>Analytics</h3>
        <p className="text-muted mb-0">Platform-wide metrics and trends.</p>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Users', value: stats.totalUsers ?? 0, color: '#1d3557' },
          { label: 'Total Courses', value: stats.totalCourses ?? 0, color: '#2d6a4f' },
          { label: 'Total Enrollments', value: stats.totalEnrollments ?? 0, color: '#457b9d' },
          { label: 'Completion Rate', value: `${stats.completionRate ?? 0}%`, color: '#e63946' },
        ].map((stat) => (
          <div className="col-sm-6 col-xl-3" key={stat.label}>
            <div className="card shadow-sm border-0 text-center py-3">
              <div className="fw-bold fs-3" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-muted small">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-semibold">Enrollment Trend</h5>
            </div>
            <div className="card-body">
              {enrollChartRaw.length === 0 ? (
                <div className="text-center text-muted py-4">No enrollment data yet.</div>
              ) : (
                <Line data={enrollChart} options={{ ...BASE_OPTIONS, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
              )}
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-semibold">Top Courses</h5>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              {topCourses.length === 0 ? (
                <div className="text-center text-muted">No data</div>
              ) : (
                <Doughnut data={topCoursesChart} options={{ plugins: { legend: { position: 'bottom' } } }} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">New User Registrations</h5>
        </div>
        <div className="card-body">
          {usersChartRaw.length === 0 ? (
            <div className="text-center text-muted py-4">No user data yet.</div>
          ) : (
            <Bar data={usersChart} options={BASE_OPTIONS} />
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
