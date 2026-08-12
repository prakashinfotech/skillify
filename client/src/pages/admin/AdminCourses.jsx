import { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  useGetCoursesQuery,
  useApproveCourseMutation,
  useRejectCourseMutation,
  useDeleteCourseMutation,
} from '../../services/courseApi'
import { adminApi } from '../../services/adminApi'
import Loader from '../../components/common/Loader'
import ConfirmModal from '../../components/common/ConfirmModal'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/formatters'

const STATUS_BADGE = { draft: 'secondary', pending: 'warning', approved: 'success', rejected: 'danger' }

const RejectModal = ({ show, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('')
  if (!show) return null
  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Reject Course</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <label className="form-label">Rejection Reason</label>
            <textarea className="form-control" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide a reason..." />
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-danger" onClick={() => onConfirm(reason)} disabled={loading || !reason.trim()}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Rejecting...</> : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const AdminCourses = () => {
  const { showToast } = useToast()
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)

  const { data, isLoading, isFetching } = useGetCoursesQuery({ search, page, limit: 10, status: statusFilter, all: true })
  const [approveCourse, { isLoading: approving }] = useApproveCourseMutation()
  const [rejectCourse, { isLoading: rejecting }] = useRejectCourseMutation()
  const [deleteCourse, { isLoading: deleting }] = useDeleteCourseMutation()

  const courses = data?.data?.courses || data?.data || []
  const totalPages = data?.data?.pages || data?.data?.totalPages || 1

  const handleApprove = async (id) => {
    try {
      await approveCourse(id).unwrap()
      dispatch(adminApi.util.invalidateTags(['AdminStats', 'Charts', 'PendingCourses']))
      showToast('Course approved!', 'success')
    } catch (err) {
      showToast(err?.data?.message || 'Approve failed', 'danger')
    }
  }

  const handleReject = async (reason) => {
    try {
      await rejectCourse({ id: rejectTarget._id, reason }).unwrap()
      dispatch(adminApi.util.invalidateTags(['AdminStats', 'Charts', 'PendingCourses']))
      showToast('Course rejected.', 'success')
      setRejectTarget(null)
    } catch (err) {
      showToast(err?.data?.message || 'Reject failed', 'danger')
    }
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

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#1d3557' }}>Course Management</h3>
          <p className="text-muted mb-0">Review and moderate platform courses.</p>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div style={{ flex: '1 1 240px' }}>
              <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search courses..." />
            </div>
            <select
              className="form-select"
              style={{ maxWidth: 160 }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="card-body p-0">
          {isLoading || isFetching ? (
            <div className="py-5"><Loader /></div>
          ) : courses.length === 0 ? (
            <div className="text-center text-muted py-5">No courses found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Teacher</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th className="text-center">Students</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td className="fw-semibold" style={{ maxWidth: 200 }}>
                        <div className="text-truncate">{course.title}</div>
                      </td>
                      <td>{course.teacher?.name || '—'}</td>
                      <td><span className="badge bg-secondary">{course.category}</span></td>
                      <td>
                        <span className={`badge bg-${STATUS_BADGE[course.status] || 'secondary'}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="text-center">{course.enrollmentCount ?? 0}</td>
                      <td><small className="text-muted">{formatDate(course.createdAt)}</small></td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {course.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                title="Approve"
                                onClick={() => handleApprove(course._id)}
                                disabled={approving}
                              >
                                <i className="bi bi-check-lg" />
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                title="Reject"
                                onClick={() => setRejectTarget(course)}
                              >
                                <i className="bi bi-x-lg" />
                              </button>
                            </>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            onClick={() => setDeleteTarget(course)}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {(data?.data?.total ?? 0) > 0 && (
          <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
            <small className="text-muted">
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, data?.data?.total ?? 0)} of {data?.data?.total ?? 0} courses
            </small>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <RejectModal
        show={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        loading={rejecting}
      />

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Course"
        message={`Delete "${deleteTarget?.title}"? All enrollments and lessons will be lost.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        confirmVariant="danger"
        confirmLabel="Delete"
      />
    </div>
  )
}

export default AdminCourses
