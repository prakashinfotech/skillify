const StatCard = ({ title, value, icon = 'bi-bar-chart', trend, color, variant, subtitle }) => {
  const colorClass = color || variant || 'primary'
  const trendPositive = trend && trend.startsWith('+')
  return (
    <div className="card border-0 shadow-sm stat-card h-100">
      <div className="card-body p-4">
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <p className="text-muted small mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>{title}</p>
            <h2 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>{value}</h2>
            {subtitle && <p className="text-muted small mb-0 mt-1">{subtitle}</p>}
            {trend && (
              <span className={`badge ${trendPositive ? 'bg-success' : 'bg-danger'} bg-opacity-15 ${trendPositive ? 'text-success' : 'text-danger'} mt-2`}>
                <i className={`bi bi-arrow-${trendPositive ? 'up' : 'down'} me-1`} />{trend}
              </span>
            )}
          </div>
          <div className={`rounded-3 p-3 bg-${colorClass} bg-opacity-10`}>
            <i className={`bi ${icon} text-${colorClass}`} style={{ fontSize: '1.5rem' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default StatCard
