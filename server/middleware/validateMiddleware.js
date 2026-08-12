const { validationResult } = require('express-validator')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }))
    return res.status(422).json({
      success: false,
      message: formatted[0].message,
      errors: formatted
    })
  }
  next()
}

module.exports = { validate }
