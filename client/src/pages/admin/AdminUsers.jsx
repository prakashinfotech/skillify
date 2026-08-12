import { useState } from 'react'
import {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} from '../../services/userApi'
import Loader from '../../components/common/Loader'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/formatters'

const ROLE_BADGE = { student: 'primary', teacher: 'success', admin: 'danger' }

const AdminUsers = () => {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading, isFetching } = useGetUsersQuery({ search, page, limit: 10, role: roleFilter })
  const [updateStatus, { isLoading: toggling }] = useUpdateUserStatusMutation()
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation()

  const users = data?.data?.users || data?.data || []
  const totalPages = data?.data?.pages || data?.data?.totalPages || 1

  const handleToggleStatus = async (user) => {
    try {
      await updateStatus({ id: user._id, isActive: !user.isActive }).unwrap()
      showToast(`User ${user.isActive ? 'deactivated' : 'activated'}.`, 'success')
    } catch (err) {
      showToast(err?.data?.message || 'Update failed', 'danger')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(deleteTarget._id).unwrap()
      showToast('User deleted.', 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err?.data?.message || 'Delete failed', 'danger')
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#1d3557' }}>User Management</h3>
          <p className="text-muted mb-0">View and manage platform users.</p>
        </div>
        <span className="badge bg-primary fs-6">{data?.data?.total ?? users.length} users</span>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div style={{ flex: '1 1 240px' }}>
              <SearchBar
                value={search}
                onChange={(v) => { setSearch(v); setPage(1) }}
                placeholder="Search by name or email..."
              />
            </div>
            <select
              className="form-select"
              style={{ maxWidth: 160 }}
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="card-body p-0">
          {isLoading || isFetching ? (
            <div className="py-5"><Loader /></div>
          ) : users.length === 0 ? (
            <div className="text-center text-muted py-5">No users found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="fw-semibold">{user.name}</td>
                      <td className="text-muted">{user.email}</td>
                      <td>
                        <span className={`badge bg-${ROLE_BADGE[user.role] || 'secondary'}`}>{user.role}</span>
                      </td>
                      <td>
                        <span className={`badge bg-${user.isActive ? 'success' : 'danger'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td><small className="text-muted">{formatDate(user.createdAt)}</small></td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className={`btn btn-sm ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                            onClick={() => handleToggleStatus(user)}
                            disabled={toggling}
                          >
                            <i className={`bi ${user.isActive ? 'bi-person-slash' : 'bi-person-check'}`} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            onClick={() => setDeleteTarget(user)}
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
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, data?.data?.total ?? 0)} of {data?.data?.total ?? 0} users
            </small>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete User"
        message={`Permanently delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        confirmVariant="danger"
        confirmLabel="Delete"
      />
    </div>
  )
}

export default AdminUsers
