import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useGetQuizzesByCourseQuery,
  useDeleteQuizMutation,
} from '../../services/quizApi'
import { useGetCourseByIdQuery } from '../../services/courseApi'
import Loader from '../../components/common/Loader'
import ConfirmModal from '../../components/common/ConfirmModal'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/formatters'

const PAGE_SIZE = 10

const TeacherQuizzes = () => {
  const { id: courseId } = useParams()
  const { showToast } = useToast()

  const { data: courseData } = useGetCourseByIdQuery(courseId)
  const { data, isLoading } = useGetQuizzesByCourseQuery(courseId)
  const [deleteQuiz, { isLoading: deleting }] = useDeleteQuizMutation()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [page, setPage] = useState(1)

  const course = courseData?.data || courseData
  const quizzes = data?.data?.quizzes || data?.data || []
  const totalPages = Math.ceil(quizzes.length / PAGE_SIZE)
  const pagedQuizzes = quizzes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = async () => {
    try {
      await deleteQuiz(deleteTarget._id).unwrap()
      showToast('Quiz deleted.', 'success')
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
          <div className="mb-1">
            <Link to="/teacher/courses" className="text-muted text-decoration-none small">
              <i className="bi bi-arrow-left me-1" />Courses
            </Link>
            <span className="text-muted small mx-1">/</span>
            <Link to={`/teacher/courses/${courseId}/lessons`} className="text-muted text-decoration-none small">
              Lessons
            </Link>
          </div>
          <h3 className="fw-bold mb-0" style={{ color: '#1d3557' }}>
            Quizzes — {course?.title || 'Loading...'}
          </h3>
        </div>
        <Link to={`/teacher/courses/${courseId}/quizzes/new`} className="btn btn-primary">
          <i className="bi bi-plus-circle me-2" />Add Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          icon="bi-question-circle"
          title="No quizzes yet"
          description="Create a quiz to assess your students."
          actionLabel="Add Quiz"
          actionTo={`/teacher/courses/${courseId}/quizzes/new`}
        />
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th className="text-center">Questions</th>
                    <th className="text-center">Pass Score</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedQuizzes.map((quiz) => (
                    <tr key={quiz._id}>
                      <td className="fw-semibold">{quiz.title}</td>
                      <td className="text-center">{quiz.questions?.length ?? 0}</td>
                      <td className="text-center">{quiz.passingScore ?? 60}%</td>
                      <td><small className="text-muted">{formatDate(quiz.createdAt)}</small></td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link
                            to={`/teacher/courses/${courseId}/quizzes/${quiz._id}/edit`}
                            className="btn btn-sm btn-outline-primary"
                            title="Edit"
                          >
                            <i className="bi bi-pencil" />
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            onClick={() => setDeleteTarget(quiz)}
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
          </div>
          {totalPages > 1 && (
            <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
              <small className="text-muted">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, quizzes.length)} of {quizzes.length}
              </small>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Quiz"
        message={`Delete "${deleteTarget?.title}"? All student results will be lost.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        confirmVariant="danger"
        confirmLabel="Delete"
      />
    </div>
  )
}

export default TeacherQuizzes
