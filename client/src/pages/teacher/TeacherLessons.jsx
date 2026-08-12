import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  useGetLessonsByCourseQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
} from '../../services/lessonApi'
import { useGetCourseByIdQuery } from '../../services/courseApi'
import Loader from '../../components/common/Loader'
import ConfirmModal from '../../components/common/ConfirmModal'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import { useToast } from '../../hooks/useToast'

const PAGE_SIZE = 10

const CONTENT_TYPES = ['video', 'article']

const EMPTY_FORM = { title: '', contentType: 'article', content: '', duration: 0, order: 1 }

const LessonFormModal = ({ show, onClose, onSave, initial, loading }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.content.trim()) errs.content = 'Content is required'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSave(form)
  }

  if (!show) return null

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{initial?._id ? 'Edit Lesson' : 'Add Lesson'}</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Title *</label>
                <input
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Content Type</label>
                  <select className="form-select" name="contentType" value={form.contentType} onChange={handleChange}>
                    {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Duration (min)</label>
                  <input type="number" className="form-control" name="duration" min={0} value={form.duration} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Order</label>
                  <input type="number" className="form-control" name="order" min={1} value={form.order} onChange={handleChange} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Content *</label>
                <textarea
                  className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                  name="content"
                  rows={6}
                  value={form.content}
                  onChange={handleChange}
                  placeholder={form.contentType === 'video' ? 'Video URL...' : 'Lesson content or URL...'}
                />
                {errors.content && <div className="invalid-feedback">{errors.content}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : 'Save Lesson'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const TeacherLessons = () => {
  const { id: courseId } = useParams()
  const { showToast } = useToast()

  const { data: courseData } = useGetCourseByIdQuery(courseId)
  const { data, isLoading } = useGetLessonsByCourseQuery(courseId)
  const [createLesson, { isLoading: creating }] = useCreateLessonMutation()
  const [updateLesson, { isLoading: updating }] = useUpdateLessonMutation()
  const [deleteLesson, { isLoading: deleting }] = useDeleteLessonMutation()

  const [formModal, setFormModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [page, setPage] = useState(1)

  const course = courseData?.data || courseData
  const lessons = data?.data?.lessons || data?.data || []
  const sortedLessons = lessons.slice().sort((a, b) => (a.order || 0) - (b.order || 0))
  const totalPages = Math.ceil(sortedLessons.length / PAGE_SIZE)
  const pagedLessons = sortedLessons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const navigate = useNavigate()
  const handleSave = async (form) => {
    try {
      if (formModal?._id) {
        await updateLesson({ id: formModal._id, ...form }).unwrap()
        showToast('Lesson updated!', 'success')
      } else {
        await createLesson({ ...form, course: courseId }).unwrap()
        showToast('Lesson created!', 'success')
      }
      setFormModal(null)
      navigate(`/teacher/courses/${courseId}/edit`)
    } catch (err) {
      showToast(err?.data?.message || 'Save failed', 'danger')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteLesson(deleteTarget._id).unwrap()
      showToast('Lesson deleted.', 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err?.data?.message || 'Delete failed', 'danger')
    }
  }

  if (isLoading) return <Loader />

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to="/teacher/courses" className="text-muted text-decoration-none small">
              <i className="bi bi-arrow-left me-1" />Courses
            </Link>
          </div>
          <h3 className="fw-bold mb-0" style={{ color: '#1d3557' }}>
            Lessons — {course?.title || 'Loading...'}
          </h3>
        </div>
        <div className="d-flex gap-2">
          <Link to={`/teacher/courses/${courseId}/quizzes`} className="btn btn-outline-secondary">
            <i className="bi bi-question-circle me-2" />Quizzes
          </Link>
          <button className="btn btn-primary" onClick={() => setFormModal({})}>
            <i className="bi bi-plus-circle me-2" />Add Lesson
          </button>
        </div>
      </div>

      {lessons.length === 0 ? (
        <EmptyState
          icon="bi-journals"
          title="No lessons yet"
          description="Add your first lesson to get started."
          actionLabel="Add Lesson"
          onAction={() => setFormModal({})}
        />
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th className="text-center">Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedLessons.map((lesson) => (
                      <tr key={lesson._id}>
                        <td className="text-muted">{lesson.order}</td>
                        <td className="fw-semibold">{lesson.title}</td>
                        <td>
                          <span className="badge bg-secondary text-capitalize">{lesson.contentType}</span>
                        </td>
                        <td className="text-center">{lesson.duration ? `${lesson.duration} min` : '—'}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setFormModal(lesson)}>
                              <i className="bi bi-pencil" />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(lesson)}>
                              <i className="bi bi-trash" />
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
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedLessons.length)} of {sortedLessons.length}
              </small>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      <LessonFormModal
        show={formModal !== null}
        onClose={() => setFormModal(null)}
        onSave={handleSave}
        initial={formModal}
        loading={creating || updating}
      />

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Lesson"
        message={`Delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        confirmVariant="danger"
        confirmLabel="Delete"
      />
    </div>
  )
}

export default TeacherLessons
