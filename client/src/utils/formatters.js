export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '—'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export const truncate = (str, length = 100) => {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '…' : str
}

export const formatScore = (score) =>
  score == null ? '—' : `${Math.round(score)}%`

export const getCategoryBadgeClass = (category) => {
  const map = {
    Mathematics: 'badge-mathematics',
    Science: 'badge-science',
    History: 'badge-history',
    'Computer Science': 'badge-computer-science',
    'Language Arts': 'badge-language-arts',
    Economics: 'badge-economics',
    Arts: 'badge-arts',
  }
  return map[category] || 'bg-secondary'
}

export const getDashboardRoute = (role) => {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'teacher') return '/teacher/dashboard'
  return '/student/dashboard'
}
