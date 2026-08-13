import Member from '../models/Member.js'

// GET /api/members
export const getMembers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 12 } = req.query
    const query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
      ]
    }
    if (status) query.membershipStatus = status

    const total = await Member.countDocuments(query)
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ members, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/members/:id
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
    if (!member) return res.status(404).json({ message: 'Member not found' })
    res.json(member)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/members
export const createMember = async (req, res) => {
  try {
    const member = await Member.create(req.body)
    res.status(201).json(member)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A member with this email already exists' })
    }
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/members/:id
export const updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!member) return res.status(404).json({ message: 'Member not found' })
    res.json(member)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/members/:id
export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id)
    if (!member) return res.status(404).json({ message: 'Member not found' })
    res.json({ message: 'Member removed successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
