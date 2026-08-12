import { Link } from 'react-router-dom'

const EmptyState = ({
  title = 'Nothing here yet',
  message,
  description,
  icon = 'bi-inbox',
  action,
  actionLabel,
  actionTo,
  onAction,
}) => {
  const displayMessage = message || description
  const resolvedAction = action || (
    (actionLabel || actionTo || onAction)
      ? { label: actionLabel, href: actionTo, onClick: onAction }
      : null
  )

  return (
    <div className="text-center py-5">
      <i className={`bi ${icon}`} style={{ fontSize: '4rem', color: 'var(--color-text-muted, #adb5bd)' }} />
      <h5 className="mt-3 fw-semibold">{title}</h5>
      {displayMessage && <p className="text-muted">{displayMessage}</p>}
      {resolvedAction && (
        resolvedAction.href
          ? <Link to={resolvedAction.href} className="btn btn-primary mt-2">{resolvedAction.label}</Link>
          : <button className="btn btn-primary mt-2" onClick={resolvedAction.onClick}>{resolvedAction.label}</button>
      )}
    </div>
  )
}
export default EmptyState
