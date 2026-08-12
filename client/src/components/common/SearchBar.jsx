const SearchBar = ({ value, onChange, placeholder = 'Search...', onClear }) => {
  const handleClear = onClear || (() => onChange(''))
  return (
    <div className="input-group" style={{ maxWidth: 360 }}>
      <span className="input-group-text bg-white border-end-0">
        <i className="bi bi-search text-muted" />
      </span>
      <input
        type="text"
        className="form-control border-start-0 ps-0"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="btn btn-outline-secondary border-start-0" type="button" onClick={handleClear}>
          <i className="bi bi-x" />
        </button>
      )}
    </div>
  )
}
export default SearchBar
