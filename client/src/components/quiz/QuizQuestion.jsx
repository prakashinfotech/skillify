const QuizQuestion = ({ question, selectedOptionId, onSelect, questionNumber, totalQuestions, isReview = false, correctOptionId, userAnswerOptionId }) => {
  const progress = Math.round((questionNumber / totalQuestions) * 100)
  
  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted small fw-bold text-uppercase">Question {questionNumber} of {totalQuestions}</span>
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 rounded-pill">{progress}%</span>
        </div>
        <div className="progress mb-3" style={{ height: 6, borderRadius: 3 }}>
          <div className="progress-bar bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="card-body px-4 pb-4 pt-2">
        <h4 className="fw-bold mb-4" style={{ lineHeight: 1.4, color: '#1d3557' }}>{question?.questionText}</h4>
        <div className="d-flex flex-column gap-3">
          {(question.options || []).map((option, idx) => {
            // BE EXTREMELY DEFENSIVE: Use _id, then id, then idx
            const optId = option._id || option.id || `opt-idx-${idx}`;
            
            let cls = 'p-3 rounded-3 border-2 d-flex align-items-center gap-3 cursor-pointer transition-all '
            
            // Fix: ensure both have values to avoid undefined === undefined matching all
            const isSelected = !!selectedOptionId && !!optId && String(selectedOptionId) === String(optId);
            
            if (isReview) {
              const isCorrect = !!correctOptionId && String(optId) === String(correctOptionId);
              const isUserAnswer = !!userAnswerOptionId && String(optId) === String(userAnswerOptionId);
              if (isCorrect) cls += 'border-success bg-success bg-opacity-10'
              else if (isUserAnswer) cls += 'border-danger bg-danger bg-opacity-10'
              else cls += 'border-light bg-light opacity-50'
            } else {
              cls += isSelected ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'border-light bg-white hover-light'
            }

            return (
              <div
                key={optId}
                className={cls}
                onClick={() => !isReview && onSelect && onSelect(optId)}
                style={{ transition: 'all 0.2s ease-in-out' }}
              >
                <div className={`rounded-circle border d-flex align-items-center justify-content-center flex-shrink-0 ${isSelected && !isReview ? 'border-primary' : 'border-secondary'}`}
                  style={{ 
                    width: 24, 
                    height: 24, 
                    backgroundColor: isSelected && !isReview ? '#0d6efd' : 'transparent', 
                    borderWidth: '2px' 
                  }}>
                  {isSelected && !isReview && (
                    <div className="rounded-circle bg-white" style={{ width: 8, height: 8 }} />
                  )}
                  {isReview && (
                    (correctOptionId && String(optId) === String(correctOptionId)) ? <i className="bi bi-check text-success" /> : 
                    (userAnswerOptionId && String(optId) === String(userAnswerOptionId)) ? <i className="bi bi-x text-danger" /> : null
                  )}
                </div>
                <span className={`fs-6 ${isSelected && !isReview ? 'fw-bold text-primary' : 'text-dark'}`}>{option.text}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default QuizQuestion
