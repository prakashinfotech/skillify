import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useCreateCourseMutation, useGetCourseByIdQuery, useBulkUpdateCourseMutation, useGetCoursesQuery } from '../../services/courseApi'
import { useGetLessonsByCourseQuery } from '../../services/lessonApi'
import { useGetQuizzesByCourseQuery } from '../../services/quizApi'
import Loader from '../../components/common/Loader'
import { useToast } from '../../hooks/useToast'
import LessonEditModal from '../../components/course/LessonEditModal'
import QuizEditModal from '../../components/course/QuizEditModal'

const CATEGORIES = ['Mathematics', 'Science', 'History', 'Computer Science', 'Language Arts', 'Economics', 'Arts', 'Other']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

const TeacherCourseForm = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: courseData, isLoading: fetchLoading, refetch: refetchCourse } = useGetCourseByIdQuery(id, { skip: !isEdit })
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation()
  const [bulkUpdate, { isLoading: bulkUpdating }] = useBulkUpdateCourseMutation()

  const { data: lessonsData, isLoading: lessonsLoading, refetch: refetchLessons } = useGetLessonsByCourseQuery(id, { skip: !isEdit })
  const { data: quizzesData, isLoading: quizzesLoading, refetch: refetchQuizzes } = useGetQuizzesByCourseQuery(id, { skip: !isEdit })

  const [form, setForm] = useState({ title: '', description: '', category: '', level: 'Beginner', thumbnail: '', price: 0, prerequisites: [] })
  const { data: allCoursesData } = useGetCoursesQuery({ limit: 100, status: 'approved' })
  const allCourses = allCoursesData?.data?.courses || []
  const [errors, setErrors] = useState({})

  // Local edited copies of lessons/quizzes
  const [editedLessons, setEditedLessons] = useState([])
  const [editedQuizzes, setEditedQuizzes] = useState([])
  const [hasUnsavedItems, setHasUnsavedItems] = useState(false)

  // Modal state
  const [lessonModal, setLessonModal] = useState(null)
  const [quizModal, setQuizModal] = useState(null)

  // Warn on navigation if items saved
  const [showLeaveWarning, setShowLeaveWarning] = useState(false)

  useEffect(() => {
    if (isEdit && courseData) {
      const c = courseData?.data?.course || courseData?.course || courseData?.data || courseData
      setForm({ 
        title: c.title || '', 
        description: c.description || '', 
        category: c.category || '', 
        level: c.level || 'Beginner', 
        thumbnail: c.thumbnail || '', 
        price: c.price ?? 0,
        prerequisites: (c.prerequisites || []).map(p => typeof p === 'object' ? p._id : p)
      })
    }
  }, [courseData, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(er => ({ ...er, [name]: undefined }))
  }

  const handleLessonSave = (lessonData) => {
    setEditedLessons(prev => {
      // If adding new in create mode, it won't have _id. We can use a temp id or index
      if (!lessonData._id) {
        // Find if we were editing a newly added lesson (using a temp property or just appending)
        return [...prev, { ...lessonData, _id: `temp-${Date.now()}` }]
      }
      const idx = prev.findIndex(l => l._id === lessonData._id)
      if (idx >= 0) return prev.map((l, i) => i === idx ? lessonData : l)
      return [...prev, lessonData]
    })
    setHasUnsavedItems(true)
    setLessonModal(null)
    showToast('Lesson added to curriculum list.', 'info')
  }

  const handleQuizSave = (quizData) => {
    setEditedQuizzes(prev => {
      if (!quizData._id) return [...prev, { ...quizData, _id: `temp-q-${Date.now()}` }]
      const idx = prev.findIndex(q => q._id === quizData._id)
      if (idx >= 0) return prev.map((q, i) => i === idx ? quizData : q)
      return [...prev, quizData]
    })
    setHasUnsavedItems(true)
    setQuizModal(null)
    showToast('Quiz added to curriculum list.', 'info')
  }

  const getMergedLessons = useCallback(() => {
    const serverLessons = lessonsData?.data?.lessons || lessonsData?.data || []
    const merged = serverLessons.map(sl => editedLessons.find(el => el._id === sl._id) || sl)
    // Add lessons that are only in local state (newly added)
    const onlyLocal = editedLessons.filter(el => !serverLessons.some(sl => sl._id === el._id))
    return [...merged, ...onlyLocal]
  }, [lessonsData, editedLessons])

  const getMergedQuizzes = useCallback(() => {
    const serverQuizzes = quizzesData?.data?.quizzes || quizzesData?.data || []
    const merged = serverQuizzes.map(sq => editedQuizzes.find(eq => eq._id === sq._id) || sq)
    const onlyLocal = editedQuizzes.filter(eq => !serverQuizzes.some(sq => sq._id === eq._id))
    return [...merged, ...onlyLocal]
  }, [quizzesData, editedQuizzes])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.category) e.category = 'Category is required'
    
    const lessonsCount = getMergedLessons().length
    if (lessonsCount === 0) {
      showToast('At least one lesson is required to create a course.', 'danger')
      e.lessons = 'Required'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      // Clean temp IDs before sending to backend
      const cleanLessons = getMergedLessons().map(({ _id, ...l }) => _id?.toString().startsWith('temp-') ? l : { ...l, _id })
      const cleanQuizzes = getMergedQuizzes().map(({ _id, ...q }) => _id?.toString().startsWith('temp-') ? q : { ...q, _id })

      if (isEdit) {
        await bulkUpdate({ id, ...form, lessons: cleanLessons, quizzes: cleanQuizzes }).unwrap()
        setEditedLessons([]); setEditedQuizzes([]); setHasUnsavedItems(false)
        await Promise.all([refetchCourse(), refetchLessons(), refetchQuizzes()])
        showToast('Course updated successfully!', 'success')
        navigate('/teacher/courses')
      } else {
        await createCourse({ ...form, lessons: cleanLessons, quizzes: cleanQuizzes }).unwrap()
        showToast('Course created successfully!', 'success')
        navigate('/teacher/courses')
      }
    } catch (err) {
      showToast(err?.data?.message || 'Save failed', 'danger')
    }
  }

  if (isEdit && fetchLoading) return <Loader />

  const isSaving = creating || bulkUpdating
  const course = courseData?.data?.course || courseData?.course || {}
  const allLessons = getMergedLessons()
  const allQuizzes = getMergedQuizzes()

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="d-flex align-items-center justify-content-between mb-4 px-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">{isEdit ? 'Course Management' : 'Create New Course'}</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/teacher/dashboard" className="text-decoration-none">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/teacher/courses" className="text-decoration-none">Courses</Link></li>
              <li className="breadcrumb-item active">{isEdit ? 'Edit' : 'New'}</li>
            </ol>
          </nav>
        </div>
        <div className="d-flex gap-2 align-items-center">
          {hasUnsavedItems && <span className="badge bg-warning text-dark me-2"><i className="bi bi-exclamation-triangle me-1" />Unsaved changes</span>}
          <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate('/teacher/courses')}>Back</button>
          <button type="submit" form="courseForm" className="btn btn-primary px-4 shadow-sm" disabled={isSaving}>
            {isSaving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : isEdit ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3 border-bottom"><h5 className="mb-0 fw-bold text-primary">Basic Information</h5></div>
            <div className="card-body p-4">
              <form id="courseForm" onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted small text-uppercase">Course Title</label>
                  <input type="text" className={`form-control form-control-lg border-2 ${errors.title ? 'is-invalid' : ''}`} name="title" value={form.title} onChange={handleChange} placeholder="e.g. Mastering React Development" style={{ borderRadius: '10px' }} />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted small text-uppercase">Description</label>
                  <textarea className={`form-control border-2 ${errors.description ? 'is-invalid' : ''}`} name="description" rows={5} value={form.description} onChange={handleChange} placeholder="Describe your course..." style={{ borderRadius: '10px' }} />
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                </div>
              </form>
            </div>
          </div>

          {/* Curriculum Builder (Always Visible) */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold"><i className="bi bi-journal-text me-2 text-primary" />Lessons <span className="badge bg-primary ms-2">{allLessons.length}</span></h5>
              <button className="btn btn-sm btn-primary" onClick={() => setLessonModal({ order: allLessons.length + 1 })}><i className="bi bi-plus-lg me-1" />Add Lesson</button>
            </div>
            <div className="card-body p-0">
              {allLessons.length === 0 ? (
                <div className="p-5 text-center">
                  <i className="bi bi-journal-x fs-1 text-muted" />
                  <p className="text-muted mt-2">At least one lesson is required.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {allLessons.map((l, idx) => (
                    <div key={l._id || idx} className="list-group-item py-3 px-4 d-flex align-items-center">
                      <div className="me-3 text-muted fw-bold" style={{ width: 28 }}>{idx + 1}</div>
                      <div className="flex-grow-1">
                        <h6 className="mb-0 fw-bold">{l.title}</h6>
                        <div className="d-flex gap-2 mt-1 small">
                          <span className="badge bg-info-subtle text-info text-capitalize">{l.contentType || 'article'}</span>
                          {l.duration > 0 && <span className="text-muted"><i className="bi bi-clock me-1" />{l.duration}m</span>}
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setLessonModal(l)}><i className="bi bi-pencil" /></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setEditedLessons(p => p.filter(el => el._id !== l._id))}><i className="bi bi-trash" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold"><i className="bi bi-question-circle me-2 text-success" />Quizzes <span className="text-muted small fw-normal ms-2">(Optional)</span></h5>
              <button className="btn btn-sm btn-outline-success" onClick={() => setQuizModal({})}><i className="bi bi-plus-lg me-1" />Add Quiz</button>
            </div>
            <div className="card-body p-0">
              {allQuizzes.length === 0 ? (
                <div className="p-5 text-center">
                  <i className="bi bi-puzzle fs-1 text-muted" />
                  <p className="text-muted mt-2">Quizzes are optional but recommended.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {allQuizzes.map((q, idx) => (
                    <div key={q._id || idx} className="list-group-item py-3 px-4 d-flex align-items-center">
                      <div className="me-3 text-success"><i className="bi bi-question-circle" /></div>
                      <div className="flex-grow-1">
                        <h6 className="mb-0 fw-bold">{q.title}</h6>
                        <div className="d-flex gap-2 mt-1 small text-muted">
                          <span>{q.questions?.length || 0} Questions</span>
                          <span>• Pass: {q.passingScore || 70}%</span>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setQuizModal(q)}><i className="bi bi-pencil" /></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setEditedQuizzes(p => p.filter(eq => eq._id !== q._id))}><i className="bi bi-trash" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3"><h6 className="mb-0 fw-bold">Classification</h6></div>
            <div className="card-body p-4">
              <div className="mb-4">
                <label className="form-label fw-semibold text-muted small text-uppercase">Category</label>
                <select className={`form-select border-2 ${errors.category ? 'is-invalid' : ''}`} name="category" value={form.category} onChange={handleChange} style={{ borderRadius: '10px' }}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category}</div>}
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold text-muted small text-uppercase">Difficulty Level</label>
                <div className="d-flex flex-wrap gap-2">
                  {LEVELS.map(level => (
                    <button key={level} type="button" className={`btn btn-sm px-3 rounded-pill border-2 ${form.level === level ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setForm(f => ({ ...f, level }))}>{level}</button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold text-muted small text-uppercase">Prerequisite Courses</label>
                <div className="dropdown">
                  <button className="btn btn-outline-secondary w-100 text-start d-flex justify-content-between align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ borderRadius: '10px' }}>
                    <span className="text-truncate">{form.prerequisites.length > 0 ? `${form.prerequisites.length} selected` : 'Select prerequisites...'}</span>
                    <i className="bi bi-chevron-down small"></i>
                  </button>
                  <div className="dropdown-menu w-100 p-3 shadow border-0" style={{ maxHeight: '300px', overflowY: 'auto', borderRadius: '12px' }}>
                    {allCourses.filter(c => c._id !== id).map(c => (
                      <div key={c._id} className="form-check mb-2">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id={`pre-${c._id}`} 
                          checked={form.prerequisites.includes(c._id)}
                          onChange={(e) => {
                            const val = c._id
                            setForm(f => ({
                              ...f,
                              prerequisites: e.target.checked 
                                ? [...f.prerequisites, val] 
                                : f.prerequisites.filter(p => p !== val)
                            }))
                          }}
                        />
                        <label className="form-check-label small" htmlFor={`pre-${c._id}`}>{c.title}</label>
                      </div>
                    ))}
                    {allCourses.filter(c => c._id !== id).length === 0 && <div className="text-muted small text-center py-2">No other courses available</div>}
                  </div>
                </div>
                {form.prerequisites.length > 0 && (
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {form.prerequisites.map(pId => {
                      const c = allCourses.find(x => x._id === pId)
                      return (
                        <span key={pId} className="badge bg-light text-dark border d-flex align-items-center gap-1 py-2 px-2" style={{ borderRadius: '6px' }}>
                          <span className="text-truncate" style={{ maxWidth: '150px' }}>{c?.title || 'Unknown'}</span>
                          <i className="bi bi-x-lg text-danger" style={{ cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, prerequisites: f.prerequisites.filter(p => p !== pId) }))}></i>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
              <div>
                <label className="form-label fw-semibold text-muted small text-uppercase">Price (USD)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-2" style={{ borderRadius: '10px 0 0 10px' }}>$</span>
                  <input type="number" className="form-control border-2" name="price" value={form.price} min={0} step={0.01} onChange={handleChange} style={{ borderRadius: '0 10px 10px 0' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3"><h6 className="mb-0 fw-bold">Course Appearance</h6></div>
            <div className="card-body p-4">
              <input type="url" className="form-control border-2" name="thumbnail" value={form.thumbnail} onChange={handleChange} placeholder="Thumbnail URL..." style={{ borderRadius: '10px' }} />
              {form.thumbnail && <div className="mt-3 rounded-3 overflow-hidden border"><img src={form.thumbnail} alt="Preview" className="img-fluid" style={{ maxHeight: 180, width: '100%', objectFit: 'cover' }} /></div>}
            </div>
          </div>

          {isEdit && (
            <div className="card border-0 shadow-sm bg-primary text-white p-4">
              <h6 className="fw-bold mb-3 text-white-50 small text-uppercase">Status</h6>
              <div className="h4 mb-0 fw-bold text-capitalize">{course.status || 'Pending'}</div>
            </div>
          )}
        </div>
      </div>

      <LessonEditModal show={lessonModal !== null} lesson={lessonModal} onSave={handleLessonSave} onClose={() => setLessonModal(null)} />
      <QuizEditModal show={quizModal !== null} quiz={quizModal} onSave={handleQuizSave} onClose={() => setQuizModal(null)} />
    </div>
  )
}

export default TeacherCourseForm
