const CourseProgressBar = ({ percentage, percent, showLabel = true, height = 8 }) => {
  const pct = Math.min(100, Math.max(0, Math.round(percentage ?? percent ?? 0)))
  const variant = pct >= 100 ? 'success' : pct >= 60 ? 'primary' : 'warning'
  return (
    <div>
      <div className="progress" style={{ height }}>
        <div
          className={`progress-bar bg-${variant}`}
          role="progressbar"
          style={{ width: `${pct}%` }}
          aria-valuenow={pct}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
      {showLabel && <small className="text-muted d-block mt-1">{pct}% complete</small>}
    </div>
  )
}
export default CourseProgressBar
