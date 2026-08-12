import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  useGetMyCoursesQuery,
  useDeleteCourseMutation,
  useSubmitForApprovalMutation,
} from '../../services/courseApi'
import Loader from '../../components/common/Loader'
import ConfirmModal from '../../components/common/ConfirmModal'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/formatters'

const PAGE_SIZE = 10

const STATUS_BADGE = {
  draft: 'secondary',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

const TeacherCourses = () => {
  const { data, isLoading } = useGetMyCoursesQuery()
  const [deleteCourse, { isLoading: deleting }] = useDeleteCourseMutation()
  const [submitForApproval, { isLoading: submitting }] = useSubmitForApprovalMutation()
  const { showToast } = useToast()

  const [deleteTarget, setDeleteTarget] = useState(null)

  // Advanced Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  const [page, setPage] = useState(1)

  const rawCourses = data?.data?.courses || data || []

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(rawCourses.map(c => c.category))
    return ['all', ...Array.from(cats)]
  }, [rawCourses])

  // Combined Filter and Sort Logic
  const filteredCourses = useMemo(() => {
    return rawCourses
      .filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            course.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || course.status === statusFilter
        const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
        return matchesSearch && matchesStatus && matchesCategory
      })
      .sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        // Handle nested or special fields
        if (sortConfig.key === 'title') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
  }, [rawCourses, searchQuery, statusFilter, categoryFilter, sortConfig])

  const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE)
  const pagedCourses = filteredCourses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <i className="bi bi-arrow-down-up ms-1 opacity-25" />
    return sortConfig.direction === 'asc' 
      ? <i className="bi bi-sort-alpha-down ms-1 text-primary" />
      : <i className="bi bi-sort-alpha-down-alt ms-1 text-primary" />
  }

  const handleDelete = async () => {
    try {
      await deleteCourse(deleteTarget._id).unwrap()
      showToast('Course deleted.', 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err?.data?.message || 'Delete failed', 'danger')
    }
  }

  const handleSubmit = async (id) => {
    try {
      await submitForApproval(id).unwrap()
      showToast('Course submitted for approval!', 'success')
    } catch (err) {
      showToast(err?.data?.message || 'Submit failed', 'danger')
    }
  }

  if (isLoading) return <Loader />

  return (
    <div className="container-fluid py-4">
      {/* Header section */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#1d3557' }}>My Courses</h2>
          <p className="text-muted mb-0 small">Manage your curriculum and monitor student enrollment performance.</p>
        </div>
        <Link to="/teacher/courses/new" className="btn btn-primary px-4 py-2 shadow-sm rounded-3 fw-bold">
          <i className="bi bi-plus-lg me-2" />Create New Course
        </Link>
      </div>

      {/* Modern Filter Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-visible">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-lg-5">
              <div className="input-group input-group-merge border rounded-3 overflow-hidden">
                <span className="input-group-text bg-transparent border-0 ps-3">
                  <i className="bi bi-search text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-0 ps-1 py-2 shadow-none"
                  placeholder="Filter by name, keywords..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="col-sm-6 col-lg-3">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem', minWidth: '60px' }}>Category</span>
                <select 
                  className="form-select form-select-sm border-0 bg-light rounded-3 shadow-none fw-semibold" 
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
                >
                  <option value="all">All Categories</option>
                  {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Status Filter */}
            <div className="col-sm-6 col-lg-3">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem', minWidth: '45px' }}>Status</span>
                <select 
                  className="form-select form-select-sm border-0 bg-light rounded-3 shadow-none fw-semibold" 
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                >
                  <option value="all">All Status</option>
                  {Object.keys(STATUS_BADGE).map(s => <option key={s} value={s} className="text-capitalize">{s}</option>)}
                </select>
              </div>
            </div>

            {/* Reset */}
            {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <div className="col-auto ms-auto">
                <button className="btn btn-link btn-sm text-decoration-none text-muted fw-bold" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); setPage(1) }}>
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon="bi-funnel"
          title="No results matching your filters"
          description="Try adjusting your search terms or filters to find what you're looking for."
          actionLabel="Reset all filters"
          onAction={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); setPage(1) }}
        />
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light border-bottom">
                  <tr>
                    <th 
                      className="ps-4 py-3 border-0 text-uppercase small fw-bold text-muted cursor-pointer hover-text-primary" 
                      onClick={() => requestSort('title')}
                    >
                      Course Details {getSortIcon('title')}
                    </th>
                    <th className="py-3 border-0 text-uppercase small fw-bold text-muted">Category</th>
                    <th 
                      className="py-3 border-0 text-uppercase small fw-bold text-muted cursor-pointer hover-text-primary"
                      onClick={() => requestSort('status')}
                    >
                      Status {getSortIcon('status')}
                    </th>
                    <th 
                      className="py-3 border-0 text-uppercase small fw-bold text-muted text-center cursor-pointer hover-text-primary"
                      onClick={() => requestSort('enrollmentCount')}
                    >
                      Stats {getSortIcon('enrollmentCount')}
                    </th>
                    <th 
                      className="py-3 border-0 text-uppercase small fw-bold text-muted cursor-pointer hover-text-primary"
                      onClick={() => requestSort('createdAt')}
                    >
                      Created {getSortIcon('createdAt')}
                    </th>
                    <th className="pe-4 py-3 border-0 text-uppercase small fw-bold text-muted text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {pagedCourses.map((course) => (
                    <tr key={course._id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3 rounded-3 overflow-hidden border shadow-sm" style={{ width: 50, height: 35 }}>
                            <img src={course.thumbnail || 'https://via.placeholder.com/50x35'} alt="" className="w-100 h-100 object-fit-cover" />
                          </div>
                          <div className="fw-bold text-dark" style={{ maxWidth: 250 }}>{course.title}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="badge bg-white text-dark border fw-medium px-3 py-2 rounded-2 shadow-xs" style={{ fontSize: '0.7rem' }}>{course.category}</span>
                      </td>
                      <td className="py-3">
                        <span className={`badge bg-${STATUS_BADGE[course.status] || 'secondary'} bg-opacity-10 text-${STATUS_BADGE[course.status] || 'secondary'} border border-${STATUS_BADGE[course.status] || 'secondary'} border-opacity-10 px-3 py-2 rounded-pill text-capitalize fw-bold`} style={{ fontSize: '0.72rem' }}>
                          {course.status}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="d-inline-flex flex-column align-items-center small bg-light px-3 py-1 rounded-3">
                          <span className="text-dark fw-bold">{course.enrollmentCount || 0}</span>
                          <span className="text-muted" style={{ fontSize: '0.65rem' }}>Students</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted small fw-medium">{formatDate(course.createdAt)}</td>
                      <td className="pe-4 py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Link to={`/teacher/courses/${course._id}/edit`} className="btn btn-sm btn-white border shadow-xs rounded-3 text-primary hover-bg-primary hover-text-white" title="Edit Course">
                            <i className="bi bi-pencil-fill" />
                          </Link>
                          <Link to={`/teacher/courses/${course._id}/progress`} className="btn btn-sm btn-white border shadow-xs rounded-3 text-success" title="Analytics">
                            <i className="bi bi-graph-up" />
                          </Link>
                          {course.status === 'draft' && (
                            <button className="btn btn-sm btn-white border shadow-xs rounded-3 text-warning" title="Submit" onClick={() => handleSubmit(course._id)}>
                              <i className="bi bi-send-fill" />
                            </button>
                          )}
                          <button className="btn btn-sm btn-white border shadow-xs rounded-3 text-danger" title="Delete" onClick={() => setDeleteTarget(course)}>
                            <i className="bi bi-trash3-fill" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
              <small className="text-muted">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCourses.length)} of {filteredCourses.length}
              </small>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will permanently remove all lessons and quizzes.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        confirmVariant="danger"
        confirmLabel="Confirm Delete"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .hover-bg-primary:hover { background-color: var(--bs-primary) !important; }
        .hover-text-white:hover { color: white !important; }
        .cursor-pointer { cursor: pointer; }
        .hover-text-primary:hover { color: var(--bs-primary) !important; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .w-fit-content { width: fit-content; }
        .btn-white { background-color: white; border-color: #eee; }
        .btn-white:hover { border-color: #ccc; }
      `}} />
    </div>
  )
}

export default TeacherCourses
