import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  useGetQuizByIdQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
} from '../../services/quizApi'
import Loader from '../../components/common/Loader'
import { useToast } from '../../hooks/useToast'

const makeOption = (text = '', isCorrect = false) => ({ text, isCorrect })

const makeQuestion = () => ({
  questionText: '',
  options: [makeOption(), makeOption(), makeOption(), makeOption()],
  explanation: '',
})

const TeacherQuizForm = () => {
  const { id: courseId, quizId } = useParams()
  const isEdit = !!quizId
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: quizData, isLoading: fetchLoading } = useGetQuizByIdQuery(quizId, { skip: !isEdit })
  const [createQuiz, { isLoading: creating }] = useCreateQuizMutation()
  const [updateQuiz, { isLoading: updating }] = useUpdateQuizMutation()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [passingScore, setPassingScore] = useState(70)
  const [questions, setQuestions] = useState([makeQuestion()])

  useEffect(() => {
    if (isEdit && quizData) {
      const q = quizData?.data?.quiz || quizData?.data || quizData
      setTitle(q.title || '')
      setDescription(q.description || '')
      setPassingScore(q.passingScore ?? 70)
      if (q.questions?.length > 0) {
        setQuestions(q.questions.map((question) => ({
          questionText: question.questionText || '',
          options: question.options?.length
            ? question.options.map((o) => ({ text: o.text || '', isCorrect: !!o.isCorrect }))
            : [makeOption(), makeOption(), makeOption(), makeOption()],
          explanation: question.explanation || '',
        })))
      }
    }
  }, [quizData, isEdit])

  const addQuestion = () => setQuestions((prev) => [...prev, makeQuestion()])

  const removeQuestion = (index) => setQuestions((prev) => prev.filter((_, i) => i !== index))

  const updateQuestion = (index, field, value) =>
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)))

  const updateOptionText = (qIndex, oIndex, text) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q
        const options = q.options.map((o, j) => (j === oIndex ? { ...o, text } : o))
        return { ...q, options }
      })
    )

  const setCorrectOption = (qIndex, oIndex) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q
        const options = q.options.map((o, j) => ({ ...o, isCorrect: j === oIndex }))
        return { ...q, options }
      })
    )

  const validate = () => {
    if (!title.trim()) { showToast('Quiz title is required', 'warning'); return false }
    for (const q of questions) {
      if (!q.questionText.trim()) { showToast('All questions must have text', 'warning'); return false }
      if (q.options.some((o) => !o.text.trim())) { showToast('All options must be filled', 'warning'); return false }
      if (!q.options.some((o) => o.isCorrect)) { showToast('Each question must have a correct answer', 'warning'); return false }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      title,
      description,
      passingScore: Number(passingScore),
      course: courseId,
      questions,
    }

    try {
      if (isEdit) {
        await updateQuiz({ id: quizId, ...payload }).unwrap()
        showToast('Quiz updated!', 'success')
      } else {
        await createQuiz(payload).unwrap()
        showToast('Quiz created!', 'success')
      }
      navigate(`/teacher/courses/${courseId}/edit`)
    } catch (err) {
      showToast(err?.data?.message || 'Save failed', 'danger')
    }
  }

  if (isEdit && fetchLoading) return <Loader />

  const isSaving = creating || updating

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="mb-4">
        <div className="mb-1">
          <Link to={`/teacher/courses/${courseId}/quizzes`} className="text-muted text-decoration-none small">
            <i className="bi bi-arrow-left me-1" />Back to Quizzes
          </Link>
        </div>
        <h3 className="fw-bold mb-0" style={{ color: '#1d3557' }}>
          {isEdit ? 'Edit Quiz' : 'Create Quiz'}
        </h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h6 className="fw-semibold mb-3">Quiz Details</h6>
            <div className="mb-3">
              <label className="form-label">Title *</label>
              <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 1 Quiz" />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional instructions..." />
            </div>
            <div style={{ maxWidth: 200 }}>
              <label className="form-label">Passing Score (%)</label>
              <input type="number" className="form-control" min={0} max={100} value={passingScore} onChange={(e) => setPassingScore(e.target.value)} />
            </div>
          </div>
        </div>

        {questions.map((question, qIndex) => (
          <div className="card shadow-sm mb-3" key={qIndex}>
            <div className="card-header bg-white d-flex align-items-center justify-content-between py-2">
              <span className="fw-semibold">Question {qIndex + 1}</span>
              {questions.length > 1 && (
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeQuestion(qIndex)}>
                  <i className="bi bi-trash" />
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Question Text *</label>
                <input
                  className="form-control"
                  value={question.questionText}
                  onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                  placeholder="Enter question..."
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Options * <small className="text-muted">(select the correct answer)</small></label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="d-flex align-items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={option.isCorrect}
                      onChange={() => setCorrectOption(qIndex, oIndex)}
                      title="Mark as correct answer"
                    />
                    <input
                      className={`form-control ${option.isCorrect ? 'border-success' : ''}`}
                      value={option.text}
                      onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}${option.isCorrect ? ' ✓ correct' : ''}`}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="form-label">Explanation (shown after quiz)</label>
                <input
                  className="form-control"
                  value={question.explanation}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  placeholder="Explain the correct answer..."
                />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="btn btn-outline-secondary mb-4 w-100" onClick={addQuestion}>
          <i className="bi bi-plus-circle me-2" />Add Question
        </button>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary px-4" disabled={isSaving}>
            {isSaving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : isEdit ? 'Update Quiz' : 'Create Quiz'}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(`/teacher/courses/${courseId}/quizzes`)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default TeacherQuizForm
