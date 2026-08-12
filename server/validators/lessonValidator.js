const { body } = require('express-validator')

const createLessonValidator = [
  body('course')
    .isMongoId()
    .withMessage('Valid course ID is required'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be an integer of at least 1')
]

const updateLessonValidator = [
  body('course')
    .optional()
    .isMongoId()
    .withMessage('Valid course ID is required'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be an integer of at least 1')
]

module.exports = { createLessonValidator, updateLessonValidator }
