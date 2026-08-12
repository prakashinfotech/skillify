const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'student'
    },
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    refreshToken: {
      type: String,
      select: false
    },
    lastLogin: {
      type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailUpdateOTP: String,
    emailUpdateExpire: Date,
    pendingEmail: String
  },
  { timestamps: true }
)

// Pre-save hook: hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Instance method: compare plain password to hash
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password)
}

// Static method: find by email including hidden fields
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email }).select('+password +refreshToken')
}

// Instance method: get reset password token
userSchema.methods.getResetPasswordToken = function () {
  const crypto = require('crypto')
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex')

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

  return resetToken
}

const User = mongoose.model('User', userSchema)
module.exports = User
