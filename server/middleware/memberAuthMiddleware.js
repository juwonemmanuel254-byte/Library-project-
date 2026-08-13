import jwt from 'jsonwebtoken'
import Member from '../models/Member.js'

export const protectMember = async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (decoded.role !== 'member')
        return res.status(401).json({ message: 'Not authorized as a member' })
      req.member = await Member.findById(decoded.id).select('-password')
      next()
    } catch {
      return res.status(401).json({ message: 'Not authorized, token failed' })
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }
}
