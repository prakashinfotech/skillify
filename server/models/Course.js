const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    slug: {
      type: String,
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    thumbnail: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Mathematics',
        'Science',
        'History',
        'Computer Science',
        'Language Arts',
        'Economics',
        'Arts'
      ]
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required']
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft'
    },
    rejectionReason: {
      type: String
    },
    tags: {
      type: [String]
    },
    totalDuration: {
      type: Number,
      default: 0
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ]
  },
  { timestamps: true }
)

// Pre-save hook: auto-generate slug when title changes
courseSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next()
  this.slug =
    this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-') +
    '-' +
    Date.now().toString(36)
  next()
})

const Course = mongoose.model('Course', courseSchema)
module.exports = Course
