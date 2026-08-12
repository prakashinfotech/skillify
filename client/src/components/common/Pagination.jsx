const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null
  const pages = []
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, currentPage + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <nav>
      <ul className="pagination justify-content-center mb-0">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>
            <i className="bi bi-chevron-left" />
          </button>
        </li>
        {start > 1 && (
          <>
            <li className="page-item"><button className="page-link" onClick={() => onPageChange(1)}>1</button></li>
            {start > 2 && <li className="page-item disabled"><span className="page-link">…</span></li>}
          </>
        )}
        {pages.map(p => (
          <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(p)}>{p}</button>
          </li>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <li className="page-item disabled"><span className="page-link">…</span></li>}
            <li className="page-item"><button className="page-link" onClick={() => onPageChange(totalPages)}>{totalPages}</button></li>
          </>
        )}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>
            <i className="bi bi-chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  )
}
export default Pagination
