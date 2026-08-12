import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useGetQuizByIdQuery, useAttemptQuizMutation } from '../../services/quizApi'
import { progressApi } from '../../services/progressApi'
import { enrollmentApi } from '../../services/enrollmentApi'
import QuizQuestion from '../../components/quiz/QuizQuestion'
import QuizResults from '../../components/quiz/QuizResults'
import Loader from '../../components/common/Loader'
import { useToast } from '../../hooks/useToast'

const StudentQuiz = () => {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { showToast } = useToast()

  const { data: quizData, isLoading } = useGetQuizByIdQuery(quizId)
  const [attemptQuiz, { isLoading: submitting }] = useAttemptQuizMutation()

  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  const quiz = quizData?.data?.quiz || quizData?.quiz
  const questions = quiz?.questions || []

  const handleSelect = (questionId, selectedOptionId) => {
    if (!questionId || !selectedOptionId) return;
    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: selectedOptionId };
      return newAnswers;
    })
  }

  // Robust calculation of answered questions
  const answeredCount = questions.filter((q, i) => {
    const qId = q._id || q.id || `q-idx-${i}`;
    return !!answers[qId];
  }).length;

  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const handleSubmit = async () => {
    if (!allAnswered) {
      showToast('Please answer all questions before submitting.', 'warning')
      return
    }
    
    const formatted = questions.map((q, i) => {
      const qId = q._id || q.id || `q-idx-${i}`;
      const optId = answers[qId];
      return {
        questionId: qId.toString(),
        selectedOptionId: optId.toString(),
      }
    })

    try {
      const res = await attemptQuiz({ id: quizId, answers: formatted }).unwrap()
      dispatch(progressApi.util.invalidateTags(['Progress']))
      dispatch(enrollmentApi.util.invalidateTags(['Enrollment']))
      setResult(res?.data || res)
      showToast('Quiz submitted successfully!', 'success')
      window.scrollTo(0, 0)
    } catch (err) {
      console.error('Submit Error:', err);
      showToast(err?.data?.message || 'Failed to submit quiz', 'danger')
    }
  }

  if (isLoading) return <Loader />
  if (!quiz) return <div className="container py-5"><div className="alert alert-danger rounded-4 shadow-sm">Quiz not found.</div></div>

  if (result) {
    return (
      <div className="container py-5" style={{ maxWidth: 800 }}>
        <QuizResults
          score={result.score}
          passed={result.passed}
          total={result.total}
          correct={result.correct}
          results={result.results}
          questions={questions}
          passingScore={result.passingScore ?? quiz.passingScore}
          onRetake={() => { setResult(null); setAnswers({}) }}
          onBack={() => navigate(-1)}
        />
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <div className="d-flex align-items-center justify-content-between mb-5 bg-white p-4 rounded-4 shadow-sm border border-light">
        <div className="d-flex align-items-center">
          <button className="btn btn-light rounded-circle me-3 shadow-none p-2" onClick={() => navigate(-1)} title="Go Back">
            <i className="bi bi-arrow-left fs-4" />
          </button>
          <div>
            <h3 className="fw-bold mb-0 text-dark">{quiz.title}</h3>
            <p className="text-muted mb-0 small"><i className="bi bi-info-circle me-1"></i>Select one answer for each question</p>
          </div>
        </div>
        <div className="text-end">
          <div className="h4 fw-bold mb-0 text-primary">{questions.length}</div>
          <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Total Questions</small>
        </div>
      </div>

      <div className="d-flex flex-column gap-2 mb-5">
        {questions.map((question, i) => {
          const qId = question._id || question.id || `q-idx-${i}`;
          return (
            <QuizQuestion
              key={qId}
              question={question}
              questionNumber={i + 1}
              totalQuestions={questions.length}
              selectedOptionId={answers[qId]}
              onSelect={(optionId) => handleSelect(qId, optionId)}
            />
          )
        })}
      </div>

      <div className="sticky-bottom bg-white p-4 rounded-4 shadow-lg border mt-5 d-flex justify-content-between align-items-center" style={{ zIndex: 100 }}>
        <div>
          <div className="fw-bold text-dark">{answeredCount} of {questions.length} Answered</div>
          <div className="progress mt-1" style={{ width: 150, height: 8, borderRadius: 4 }}>
            <div className="progress-bar bg-success progress-bar-striped progress-bar-animated" style={{ width: `${(answeredCount / questions.length) * 100}%` }}></div>
          </div>
        </div>
        <button
          className="btn btn-primary px-5 py-3 rounded-3 fw-bold shadow transition-all"
          onClick={handleSubmit}
          disabled={submitting || !allAnswered}
          style={{ minWidth: 220 }}
        >
          {submitting ? (
            <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
          ) : (
            'Finish & Submit Quiz'
          )}
        </button>
      </div>
    </div>
  )
}

export default StudentQuiz
