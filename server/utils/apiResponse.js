const success = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data })

const error = (res, message = 'Error', statusCode = 500) =>
  res.status(statusCode).json({ success: false, message })

module.exports = { success, error }
