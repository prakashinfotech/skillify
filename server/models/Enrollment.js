const mongoose = require('mongoose')

const enrollmentSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active'
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
)

// Compound unique index: one enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true })

const Enrollment = mongoose.model('Enrollment', enrollmentSchema)
module.exports = Enrollment
