const jwt = require('jsonwebtoken')

const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`)
  err.statusCode = 404
  next(err)
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500
  let message = err.message || 'Internal Server Error'
  let details = undefined

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Resource not found'
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400
    const fieldMessages = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }))
    message = fieldMessages.map((f) => f.message).join(', ')
    details = fieldMessages
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    message = `Duplicate value for field: ${field}`
  }

  // JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401
    message = 'Invalid token'
  }

  if (err instanceof jwt.TokenExpiredError) {
    statusCode = 401
    message = 'Token expired'
  }

  const response = {
    success: false,
    message
  }

  if (details) {
    response.errors = details
  }

  // Never expose stack trace in production
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}

module.exports = { notFound, errorHandler }
