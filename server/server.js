import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes       from './routes/auth.js'
import bookRoutes       from './routes/books.js'
import memberRoutes     from './routes/members.js'
import borrowRoutes     from './routes/borrows.js'
import memberAuthRoutes from './routes/memberAuth.js'
import memberPortal     from './routes/memberPortal.js'

dotenv.config()

const app = express()

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL,
      'https://library-project-6kk8.onrender.com',
    ].filter(Boolean)
  : ['http://localhost:5173']

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    // In development allow all
    if (process.env.NODE_ENV !== 'production') return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth',        authRoutes)
app.use('/api/books',       bookRoutes)
app.use('/api/members',     memberRoutes)
app.use('/api/borrows',     borrowRoutes)
app.use('/api/member-auth', memberAuthRoutes)
app.use('/api/portal',      memberPortal)

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Library Management System API is running.' })
})

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/librarydb'

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })
 
