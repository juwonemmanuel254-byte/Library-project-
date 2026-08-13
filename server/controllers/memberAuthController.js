import jwt from 'jsonwebtoken'
import Member from '../models/Member.js'

const generateToken = (id) => jwt.sign({ id, role: 'member' }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/member-auth/register — public self-registration
export const memberRegister = async (req, res) => {
  const { name, email, password, phone, address } = req.body
  try {
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' })

    const existing = await Member.findOne({ email })
    if (existing && existing.password)
      return res.status(400).json({ message: 'An account with this email already exists' })

    let member
    if (existing && !existing.password) {
      // Librarian already added this member — just attach a password
      existing.password = password
      if (phone)   existing.phone   = phone
      if (address) existing.address = address
      member = await existing.save()
    } else {
      member = await Member.create({ name, email, password, phone, address })
    }

    res.status(201).json({
      _id:              member._id,
      name:             member.name,
      email:            member.email,
      memberId:         member.memberId,
      membershipStatus: member.membershipStatus,
      role:             'member',
      token:            generateToken(member._id),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/member-auth/login
export const memberLogin = async (req, res) => {
  const { email, password } = req.body
  try {
    const member = await Member.findOne({ email })
    if (!member || !member.password)
      return res.status(401).json({ message: 'Invalid email or password' })

    const match = await member.matchPassword(password)
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password' })

    if (member.membershipStatus === 'suspended')
      return res.status(403).json({ message: 'Your account has been suspended. Please contact the library.' })

    res.json({
      _id:              member._id,
      name:             member.name,
      email:            member.email,
      memberId:         member.memberId,
      membershipStatus: member.membershipStatus,
      role:             'member',
      token:            generateToken(member._id),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/member-auth/me
export const getMemberMe = async (req, res) => {
  try {
    const member = await Member.findById(req.member._id).select('-password')
    res.json({ ...member.toObject(), role: 'member' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
