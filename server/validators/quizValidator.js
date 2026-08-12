const { body } = require('express-validator')

const createQuizValidator = [
  body('course')
    .isMongoId()
    .withMessage('Valid course ID is required'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.questionText')
    .trim()
    .notEmpty()
    .withMessage('Each question must have question text')
]

const updateQuizValidator = [
  body('course')
    .optional()
    .isMongoId()
    .withMessage('Valid course ID is required'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('questions')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.questionText')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Each question must have question text')
]

module.exports = { createQuizValidator, updateQuizValidator }
