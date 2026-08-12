const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required']
    },
    description: {
      type: String
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    contentType: {
      type: String,
      enum: ['video', 'article', 'pdf'],
      default: 'article'
    },
    videoUrl: {
      type: String
    },
    order: {
      type: Number,
      required: [true, 'Order is required']
    },
    duration: {
      type: Number,
      default: 10
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const Lesson = mongoose.model('Lesson', lessonSchema)
module.exports = Lesson
