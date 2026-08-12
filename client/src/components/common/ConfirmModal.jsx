const ConfirmModal = ({
  show,
  onConfirm,
  onCancel,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText,
  confirmLabel,
  variant,
  confirmVariant,
  loading = false,
}) => {
  const btnVariant = confirmVariant || variant || 'danger'
  const btnLabel = confirmLabel || confirmText || 'Confirm'

  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onCancel} style={{ zIndex: 1040 }} />
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">{title}</h5>
              <button type="button" className="btn-close" onClick={onCancel} />
            </div>
            <div className="modal-body"><p className="text-muted mb-0">{message}</p></div>
            <div className="modal-footer border-0 pt-0">
              <button className="btn btn-light" onClick={onCancel} disabled={loading}>Cancel</button>
              <button className={`btn btn-${btnVariant}`} onClick={onConfirm} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Loading...</> : btnLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default ConfirmModal
