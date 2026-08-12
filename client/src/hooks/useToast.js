import { toast } from 'react-toastify'

const useToast = () => ({
  toastSuccess: (msg) => toast.success(msg),
  toastError: (msg) => toast.error(msg),
  toastInfo: (msg) => toast.info(msg),
  toastWarning: (msg) => toast.warning(msg),
  showToast: (msg, variant = 'success') => {
    const map = {
      success: toast.success,
      danger: toast.error,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
    }
    const fn = map[variant] || toast.info
    fn(msg)
  },
})

export { useToast }
export default useToast
