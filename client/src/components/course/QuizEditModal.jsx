import { useState, useEffect } from 'react'

const makeOption = (text = '', isCorrect = false) => ({ text, isCorrect })
const makeQuestion = () => ({ questionText: '', options: [makeOption(), makeOption(), makeOption(), makeOption()], explanation: '' })

const QuizEditModal = ({ show, quiz, onSave, onClose }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [passingScore, setPassingScore] = useState(70)
  const [questions, setQuestions] = useState([makeQuestion()])

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title || '')
      setDescription(quiz.description || '')
      setPassingScore(quiz.passingScore ?? 70)
      if (quiz.questions?.length) {
        setQuestions(quiz.questions.map(q => ({
          questionText: q.questionText || '',
          options: q.options?.length ? q.options.map(o => ({ text: o.text || '', isCorrect: !!o.isCorrect })) : [makeOption(), makeOption(), makeOption(), makeOption()],
          explanation: q.explanation || '',
        })))
      } else {
        setQuestions([makeQuestion()])
      }
    }
  }, [quiz])

  if (!show) return null

  const updateQ = (i, f, v) => setQuestions(p => p.map((q, idx) => idx === i ? { ...q, [f]: v } : q))
  const updateOpt = (qi, oi, text) => setQuestions(p => p.map((q, i) => i !== qi ? q : { ...q, options: q.options.map((o, j) => j === oi ? { ...o, text } : o) }))
  const setCorrect = (qi, oi) => setQuestions(p => p.map((q, i) => i !== qi ? q : { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oi })) }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ _id: quiz?._id, title, description, passingScore: +passingScore, questions })
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <h5 className="modal-title fw-bold fs-4">{quiz?._id ? 'Edit Quiz' : 'Add Quiz'}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          
          <div className="modal-body px-4">
            <form id="quizForm" onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase">Quiz Title *</label>
                <input 
                  className="form-control form-control-lg border-2" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Final Assessment"
                  required 
                  style={{ borderRadius: '10px' }}
                />
              </div>
              
              <div className="row g-3 mb-4">
                <div className="col-md-8">
                  <label className="form-label fw-bold small text-muted text-uppercase">Description</label>
                  <input 
                    className="form-control border-2" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Briefly describe the quiz..."
                    style={{ borderRadius: '10px' }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold small text-muted text-uppercase">Passing Score (%)</label>
                  <div className="input-group">
                    <input 
                      type="number" 
                      className="form-control border-2" 
                      min={0} max={100} 
                      value={passingScore} 
                      onChange={e => setPassingScore(e.target.value)} 
                      style={{ borderRadius: '10px 0 0 10px' }}
                    />
                    <span className="input-group-text bg-light border-2 border-start-0" style={{ borderRadius: '0 10px 10px 0' }}>%</span>
                  </div>
                </div>
              </div>

              <hr className="my-4 opacity-10" />
              
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0 text-primary">Questions ({questions.length})</h6>
              </div>

              {questions.map((q, qi) => (
                <div key={qi} className="card border-0 shadow-sm mb-4 bg-light" style={{ borderRadius: '12px' }}>
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-primary rounded-pill px-3">Question {qi + 1}</span>
                      {questions.length > 1 && (
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger border-0" 
                          onClick={() => setQuestions(p => p.filter((_, i) => i !== qi))}
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <textarea 
                        className="form-control border-0 shadow-none bg-white" 
                        rows={2}
                        placeholder="What is the question?" 
                        value={q.questionText} 
                        onChange={e => updateQ(qi, 'questionText', e.target.value)}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    
                    <div className="row g-2 mb-3">
                      {q.options.map((o, oi) => (
                        <div key={oi} className="col-md-6">
                          <div className={`d-flex align-items-center p-2 rounded-3 border-2 ${o.isCorrect ? 'border-success bg-success bg-opacity-10' : 'border-white bg-white'}`}>
                            <div className="form-check mb-0 me-2">
                              <input 
                                className="form-check-input shadow-none cursor-pointer" 
                                type="radio" 
                                name={`q${qi}`} 
                                checked={o.isCorrect} 
                                onChange={() => setCorrect(qi, oi)} 
                              />
                            </div>
                            <input 
                              className="form-control form-control-sm border-0 bg-transparent shadow-none" 
                              value={o.text} 
                              onChange={e => updateOpt(qi, oi, e.target.value)} 
                              placeholder={`Option ${oi + 1}`} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white border-0"><i className="bi bi-info-circle text-muted"></i></span>
                      <input 
                        className="form-control border-0 bg-white" 
                        placeholder="Explanation for students (optional)" 
                        value={q.explanation} 
                        onChange={e => updateQ(qi, 'explanation', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                type="button" 
                className="btn btn-outline-primary w-100 border-2 py-2 mb-4" 
                onClick={() => setQuestions(p => [...p, makeQuestion()])}
                style={{ borderStyle: 'dashed', borderRadius: '10px' }}
              >
                <i className="bi bi-plus-lg me-2" />Add New Question
              </button>
            </form>
          </div>
          
          <div className="modal-footer border-0 px-4 pb-4 pt-0 bg-white" style={{ borderRadius: '0 0 15px 15px' }}>
            <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={onClose} style={{ borderRadius: '10px' }}>Cancel</button>
            <button type="submit" form="quizForm" className="btn btn-primary px-5 py-2 shadow" style={{ borderRadius: '10px' }}>Save Quiz</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizEditModal
