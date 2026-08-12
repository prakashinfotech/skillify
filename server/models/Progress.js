const mongoose = require('mongoose')

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required']
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
      }
    ],
    quizAttempts: [
      {
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        score: { type: Number },
        passed: { type: Boolean },
        answers: [
          {
            questionId: { type: String },
            selectedOptionId: { type: String }
          }
        ],
        attemptedAt: { type: Date, default: Date.now }
      }
    ],
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    percentComplete: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

// Compound unique index: one progress record per student per course
progressSchema.index({ student: 1, course: 1 }, { unique: true })

const Progress = mongoose.model('Progress', progressSchema)
module.exports = Progress
