const { body } = require('express-validator')

const CATEGORIES = [
  'Mathematics',
  'Science',
  'History',
  'Computer Science',
  'Language Arts',
  'Economics',
  'Arts'
]

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

const createCourseValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('category')
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('level')
    .optional()
    .isIn(LEVELS)
    .withMessage(`Level must be one of: ${LEVELS.join(', ')}`)
]

const updateCourseValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('category')
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('level')
    .optional()
    .isIn(LEVELS)
    .withMessage(`Level must be one of: ${LEVELS.join(', ')}`)
]

module.exports = { createCourseValidator, updateCourseValidator }
