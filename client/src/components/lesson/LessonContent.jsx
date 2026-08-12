const toEmbedUrl = (url) => {
  if (!url) return null
  if (url.includes('youtube.com/embed/')) return url
  const short = url.match(/youtu\.be\/([^?&]+)/)
  if (short) return `https://www.youtube.com/embed/${short[1]}`
  const watch = url.match(/[?&]v=([^?&]+)/)
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`
  return null
}

const LessonContent = ({ lesson }) => {
  if (!lesson) return null

  const isVideo = lesson.contentType === 'video'
  const rawVideoSrc = lesson.videoUrl || (isVideo ? lesson.content : null)
  const embedUrl = toEmbedUrl(rawVideoSrc)

  return (
    <div>
      {embedUrl && (
        <div className="video-container mb-4 rounded-3 overflow-hidden shadow-sm">
          <iframe
            src={embedUrl}
            title={lesson.title}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}
      <div className="d-flex align-items-center gap-3 mb-3">
        <span className="badge bg-primary bg-opacity-10 text-primary">Lesson {lesson.order}</span>
        <span className="text-muted small"><i className="bi bi-clock me-1" />{lesson.duration} min</span>
      </div>
      <h4 className="fw-bold mb-3">{lesson.title}</h4>
      {lesson.description && <p className="text-muted mb-3">{lesson.description}</p>}
      {!isVideo && (
        <div className="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.content }} style={{ lineHeight: 1.8 }} />
      )}
    </div>
  )
}
export default LessonContent
