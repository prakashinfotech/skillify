import SearchBar from '../common/SearchBar'

const CATEGORIES = ['Mathematics', 'Science', 'History', 'Computer Science', 'Language Arts', 'Economics', 'Arts']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
]

const CourseFilters = ({ filters = {}, onChange }) => {
  const hasFilters = filters.search || filters.category || filters.level || filters.teacher || (filters.sort && filters.sort !== 'newest')
  return (
    <div className="d-flex flex-wrap align-items-center gap-3 py-3">
      <SearchBar
        value={filters.search || ''}
        onChange={(v) => onChange({ ...filters, search: v, page: 1 })}
        onClear={() => onChange({ ...filters, search: '', page: 1 })}
        placeholder="Search courses..."
      />
      <select className="form-select form-select-sm" style={{ width: 'auto' }}
        value={filters.category || ''}
        onChange={(e) => onChange({ ...filters, category: e.target.value, page: 1 })}>
        <option value="">All Categories</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 'auto' }}
        value={filters.level || ''}
        onChange={(e) => onChange({ ...filters, level: e.target.value, page: 1 })}>
        <option value="">All Levels</option>
        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 'auto' }}
        value={filters.sort || 'newest'}
        onChange={(e) => onChange({ ...filters, sort: e.target.value, page: 1 })}>
        {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      {hasFilters && (
        <button className="btn btn-sm btn-outline-secondary"
          onClick={() => onChange({ search: '', category: '', level: '', teacher: '', sort: 'newest', page: 1 })}>
          <i className="bi bi-x me-1" />Clear
        </button>
      )}
    </div>
  )
}
export default CourseFilters
