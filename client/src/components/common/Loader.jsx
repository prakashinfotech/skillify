const Loader = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: 'rgba(255,255,255,0.95)' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status" />
          <p className="text-muted fw-semibold">Loading Skillify...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}
export default Loader
