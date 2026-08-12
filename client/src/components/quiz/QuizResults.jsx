const QuizResults = ({ score = 0, passed = false, total = 0, correct = 0, results = [], questions = [], onRetake, onBack, passingScore = 70 }) => {
  const primaryColor = passed ? '#2d6a4f' : '#dc3545'
  
  return (
    <div className="fade-in">
      {/* Summary Section */}
      <div className="card border-0 shadow-sm rounded-4 mb-5 overflow-hidden">
        <div className={`card-body p-5 text-center ${passed ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 shadow-sm bg-white"
            style={{ width: 160, height: 160, border: `10px solid ${primaryColor}` }}>
            <span className="fw-bold" style={{ fontSize: '2.5rem', color: primaryColor }}>{score}%</span>
          </div>
          <h2 className={`fw-bold mb-2 ${passed ? 'text-success' : 'text-danger'}`}>
            {passed ? '🎉 Congratulations! You Passed' : 'Keep Practicing!'}
          </h2>
          <p className="text-muted fs-5 mb-4">
            You answered {correct} out of {total} questions correctly.
          </p>
          
          <div className="row justify-content-center g-4 mb-5">
            <div className="col-6 col-md-3">
              <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100">
                <div className="small fw-bold text-uppercase text-muted mb-1" style={{ fontSize: '0.65rem' }}>Your Score</div>
                <div className={`h3 mb-0 fw-bold ${passed ? 'text-success' : 'text-danger'}`}>{score}%</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 bg-white shadow-sm p-3 rounded-3 h-100">
                <div className="small fw-bold text-uppercase text-muted mb-1" style={{ fontSize: '0.65rem' }}>Passing Score</div>
                <div className="h3 mb-0 fw-bold text-dark">{passingScore}%</div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-3">
            {onRetake && (
              <button className="btn btn-outline-secondary px-4 py-3 rounded-3 fw-bold flex-grow-1" style={{ maxWidth: 200 }} onClick={onRetake}>
                <i className="bi bi-arrow-repeat me-2" />Retake Quiz
              </button>
            )}
            {onBack && (
              <button className="btn btn-primary px-4 py-3 rounded-3 fw-bold flex-grow-1 shadow-sm" style={{ maxWidth: 200 }} onClick={onBack}>
                <i className="bi bi-arrow-left me-2" />Back to Course
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Review */}
      {results.length > 0 && (
        <div className="px-1">
          <h4 className="fw-bold mb-4 d-flex align-items-center">
            <i className="bi bi-card-checklist me-3 text-primary fs-3"></i> Detailed Performance Review
          </h4>
          <div className="d-flex flex-column gap-3">
            {results.map((r, i) => {
              const q = questions.find(q => (q._id || q.id) === r.questionId) || {}
              return (
                <div key={i} className="card border-0 shadow-sm rounded-4 overflow-hidden border-start border-4" style={{ borderColor: r.correct ? '#198754' : '#dc3545' }}>
                  <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                    <span className={`badge ${r.correct ? 'bg-success' : 'bg-danger'} rounded-pill px-3`}>
                      {r.correct ? <i className="bi bi-check-circle me-1" /> : <i className="bi bi-x-circle me-1" />}
                      Question {i + 1} • {r.correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-4" style={{ color: '#1d3557' }}>{q.questionText || r.questionText}</h5>
                    <div className="d-flex flex-column gap-2 mb-3">
                      {(q.options || []).map(o => {
                        const optId = o._id || o.id;
                        const isCorrect = optId === r.correctOptionId;
                        const isSelected = optId === r.selectedOptionId;
                        
                        let optCls = 'p-3 rounded-3 border-2 d-flex align-items-center gap-3 '
                        if (isCorrect) optCls += 'border-success bg-success bg-opacity-10'
                        else if (isSelected && !isCorrect) optCls += 'border-danger bg-danger bg-opacity-10'
                        else optCls += 'border-light bg-light opacity-75'

                        return (
                          <div key={optId} className={optCls}>
                            <div className={`rounded-circle border d-flex align-items-center justify-content-center flex-shrink-0 ${isCorrect ? 'bg-success border-success' : isSelected ? 'bg-danger border-danger' : 'border-secondary'}`}
                              style={{ width: 22, height: 22 }}>
                              {isCorrect ? <i className="bi bi-check text-white small" /> : isSelected ? <i className="bi bi-x text-white small" /> : null}
                            </div>
                            <span className={`small ${isCorrect ? 'fw-bold text-success' : isSelected ? 'fw-bold text-danger' : 'text-muted'}`}>{o.text}</span>
                          </div>
                        )
                      })}
                    </div>
                    {r.explanation && (
                      <div className="p-3 bg-primary bg-opacity-10 rounded-3 border-start border-4 border-primary mt-3">
                        <div className="small fw-bold text-primary text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Explanation</div>
                        <p className="small mb-0 text-dark opacity-75"><i className="bi bi-lightbulb-fill text-warning me-2" />{r.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizResults
