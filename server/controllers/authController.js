import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { sendStaffWelcomeEmail } from '../utils/emailService.js'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// GET /api/auth/setup-status — check if any admin exists
export const setupStatus = async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' })
    res.json({ needsSetup: adminCount === 0 })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/setup — create the very first admin (only works if no admin exists)
export const setupAdmin = async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' })
    if (adminCount > 0) {
      return res.status(403).json({ message: 'Setup already completed. An admin account already exists.' })
    }
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' })
    }
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' })
    }
    const user = await User.create({ name, email, password, role: 'admin' })
    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/register — admin creates a staff account from the dashboard
export const register = async (req, res) => {
  const { name, email, password, role } = req.body

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const user = await User.create({ name, email, password, role })

    // Send welcome email with credentials and invite code
    const createdBy = req.user?.name || 'Administrator'
    sendStaffWelcomeEmail({
      name,
      email,
      password,          // plain text — before hashing on save
      role:      user.role,
      inviteCode: process.env.STAFF_INVITE_CODE,
      createdBy,
    }).catch((err) => console.error('Email send failed:', err.message))

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/staff-register — staff self-register with invite code
export const staffRegister = async (req, res) => {
  const { name, email, password, inviteCode } = req.body
  try {
    const validCode = process.env.STAFF_INVITE_CODE
    if (!inviteCode || inviteCode.trim() !== validCode) {
      return res.status(403).json({ message: 'Invalid staff invite code. Please contact your administrator.' })
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' })
    }
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' })
    }
    const user = await User.create({ name, email, password, role: 'librarian' })
    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json(req.user)
}
