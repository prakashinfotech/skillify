require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const courseRoutes = require('./routes/courseRoutes')
const lessonRoutes = require('./routes/lessonRoutes')
const quizRoutes = require('./routes/quizRoutes')
const enrollmentRoutes = require('./routes/enrollmentRoutes')
const progressRoutes = require('./routes/progressRoutes')
const adminRoutes = require('./routes/adminRoutes')
const mcpServer = require('./mcp/mcpServer')

connectDB()

const app = express()

app.use(helmet())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api/', apiLimiter)

app.get('/api/v1/health', (req, res) => res.json({ success: true, message: 'API is running' }))

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/lessons', lessonRoutes)
app.use('/api/v1/quizzes', quizRoutes)
app.use('/api/v1/enrollments', enrollmentRoutes)
app.use('/api/v1/progress', progressRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/mcp', mcpServer)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
})

module.exports = app
