import { useState, useEffect } from 'react'

const TYPES = ['video', 'article', 'pdf', 'doc']

const LessonEditModal = ({ show, lesson, onSave, onClose }) => {
  const [form, setForm] = useState({ title: '', description: '', contentType: 'article', content: '', duration: 0, order: 1 })
  const [errors, setErrors] = useState({})
  const [uploadMode, setUploadMode] = useState('url') // 'url' or 'upload'

  useEffect(() => {
    if (lesson) {
      setForm({
        title: lesson.title || '',
        description: lesson.description || '',
        contentType: lesson.contentType || 'article',
        content: lesson.content || '',
        duration: lesson.duration || 0,
        order: lesson.order || 1,
      })
      // If content starts with http, it's likely a URL, otherwise could be a local path but we'll default to URL for now
      setUploadMode('url')
    }
  }, [lesson])

  if (!show) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.content.trim()) errs.content = 'Content or File is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ ...form, _id: lesson?._id })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // In a real app, we would upload the file here and get a URL
      // For POC, we'll simulate it by setting a dummy path or base64
      setForm(f => ({ ...f, content: `uploads/${file.name}` }))
      showToast && showToast(`File "${file.name}" selected.`, 'success')
    }
  }

  const renderContentInput = () => {
    const isFileBased = form.contentType === 'pdf' || form.contentType === 'doc'
    
    if (form.contentType === 'video') {
      return (
        <div className="mb-2">
          <label className="form-label fw-bold small text-muted text-uppercase">Video URL *</label>
          <div className="input-group shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-play-circle-fill text-danger fs-5"></i></span>
            <input 
              type="url"
              className={`form-control border-start-0 py-2 ${errors.content ? 'is-invalid' : ''}`} 
              value={form.content}
              onChange={e => { setForm(f => ({ ...f, content: e.target.value })); setErrors(er => ({ ...er, content: undefined })) }}
              placeholder="Paste YouTube/Vimeo link here..."
            />
          </div>
        </div>
      )
    }

    if (isFileBased) {
      return (
        <div className="mb-2">
          <label className="form-label fw-bold small text-muted text-uppercase d-flex justify-content-between">
            {form.contentType.toUpperCase()} Content *
            <div className="btn-group btn-group-sm" role="group">
              <button type="button" className={`btn py-0 px-2 ${uploadMode === 'url' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setUploadMode('url')}>Link</button>
              <button type="button" className={`btn py-0 px-2 ${uploadMode === 'upload' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setUploadMode('upload')}>Upload</button>
            </div>
          </label>

          {uploadMode === 'url' ? (
            <div className="input-group shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
              <span className="input-group-text bg-white border-end-0">
                <i className={`bi ${form.contentType === 'pdf' ? 'bi-file-earmark-pdf-fill text-danger' : 'bi-file-earmark-word-fill text-primary'} fs-5`}></i>
              </span>
              <input 
                type="url"
                className={`form-control border-start-0 py-2 ${errors.content ? 'is-invalid' : ''}`} 
                value={form.content}
                onChange={e => { setForm(f => ({ ...f, content: e.target.value })); setErrors(er => ({ ...er, content: undefined })) }}
                placeholder={`Paste ${form.contentType.toUpperCase()} link here...`}
              />
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed rounded-3 text-center bg-light cursor-pointer position-relative" style={{ borderStyle: 'dashed !important' }}>
              <input 
                type="file" 
                className="position-absolute w-100 h-100 top-0 start-0 opacity-0 cursor-pointer" 
                accept={form.contentType === 'pdf' ? '.pdf' : '.doc,.docx'}
                onChange={handleFileUpload}
              />
              <i className={`bi ${form.contentType === 'pdf' ? 'bi-cloud-arrow-up-fill text-danger' : 'bi-cloud-arrow-up-fill text-primary'} fs-1 mb-2`}></i>
              <div className="fw-bold text-dark">Click or Drag to Upload {form.contentType.toUpperCase()}</div>
              <div className="small text-muted">Maximum file size: 10MB</div>
              {form.content && form.content.startsWith('uploads/') && (
                <div className="mt-2 badge bg-success p-2 w-100 text-truncate">
                  <i className="bi bi-check-circle me-1"></i> {form.content.replace('uploads/', '')}
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="mb-2">
        <label className="form-label fw-bold small text-muted text-uppercase">Article Content *</label>
        <textarea 
          className={`form-control border-2 shadow-sm ${errors.content ? 'is-invalid' : ''}`} 
          rows={8} 
          value={form.content}
          onChange={e => { setForm(f => ({ ...f, content: e.target.value })); setErrors(er => ({ ...er, content: undefined })) }}
          placeholder="Type your educational content here..."
          style={{ borderRadius: '10px' }}
        />
      </div>
    )
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          <div className="modal-header border-0 pb-0 px-4 pt-4 bg-white">
            <h5 className="modal-title fw-bold fs-4 text-dark d-flex align-items-center">
              <span className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                <i className={`bi ${lesson?._id ? 'bi-pencil-square' : 'bi-plus-circle'}`}></i>
              </span>
              {lesson?._id ? 'Update Lesson' : 'Create New Lesson'}
            </h5>
            <button type="button" className="btn-close shadow-none" onClick={onClose} aria-label="Close"></button>
          </div>
          
          <form id="lessonForm" onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-3">
              <div className="row g-3 mb-4">
                <div className="col-md-7">
                  <label className="form-label fw-bold small text-muted text-uppercase">Lesson Title *</label>
                  <input 
                    className={`form-control border-2 py-2 ${errors.title ? 'is-invalid' : ''}`} 
                    value={form.title}
                    onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: undefined })) }}
                    placeholder="e.g. 01. Getting Started"
                    style={{ borderRadius: '10px' }}
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>
                <div className="col-md-5">
                  <label className="form-label fw-bold small text-muted text-uppercase">Content Type</label>
                  <select 
                    className="form-select border-2 py-2 text-capitalize shadow-none" 
                    value={form.contentType}
                    onChange={e => setForm(f => ({ ...f, contentType: e.target.value }))}
                    style={{ borderRadius: '10px' }}
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase">Brief Summary</label>
                <input 
                  className="form-control border-2 py-2" 
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Tell students what they will learn in this lesson..."
                  style={{ borderRadius: '10px' }}
                />
              </div>
              
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-muted text-uppercase">Est. Duration</label>
                  <div className="input-group shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-clock text-primary"></i></span>
                    <input 
                      type="number" 
                      className="form-control border-start-0 py-2 border-end-0" 
                      min={0} 
                      value={form.duration}
                      onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))}
                    />
                    <span className="input-group-text bg-white border-start-0 text-muted small">minutes</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-muted text-uppercase">Sequence Order</label>
                  <div className="input-group shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-list-ol text-primary"></i></span>
                    <input 
                      type="number" 
                      className="form-control border-start-0 py-2" 
                      min={1} 
                      value={form.order}
                      onChange={e => setForm(f => ({ ...f, order: +e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-light p-3 rounded-4 mb-2">
                {renderContentInput()}
                {errors.content && <div className="text-danger small mt-2 fw-bold"><i className="bi bi-exclamation-circle me-1"></i>{errors.content}</div>}
              </div>
            </div>
            
            <div className="modal-footer border-0 px-4 pb-4 pt-2 bg-white d-flex gap-3">
              <button type="button" className="btn btn-light px-4 py-2 flex-grow-1 fw-bold text-muted" onClick={onClose} style={{ borderRadius: '12px' }}>Discard Changes</button>
              <button type="submit" className="btn btn-primary px-5 py-2 flex-grow-1 fw-bold shadow-sm" style={{ borderRadius: '12px' }}>
                <i className="bi bi-check2-circle me-2"></i>{lesson?._id ? 'Update Lesson' : 'Create Lesson'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LessonEditModal
