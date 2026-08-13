import express from 'express'
import { protectMember } from '../middleware/memberAuthMiddleware.js'
import Borrow from '../models/Borrow.js'
import Book   from '../models/Book.js'

const router = express.Router()

// GET /api/portal/my-borrows — logged-in member's own borrow history
router.get('/my-borrows', protectMember, async (req, res) => {
  try {
    const borrows = await Borrow.find({ member: req.member._id })
      .populate('book', 'title author isbn category')
      .sort({ borrowDate: -1 })
    res.json(borrows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/portal/request-borrow — member requests to borrow a book
router.post('/request-borrow', protectMember, async (req, res) => {
  try {
    const { bookId } = req.body
    const member = req.member

    if (member.membershipStatus !== 'active')
      return res.status(400).json({ message: 'Your membership is not active.' })

    if (member.booksCurrentlyBorrowed >= 5)
      return res.status(400).json({ message: 'You have reached the maximum of 5 borrowed books.' })

    const book = await Book.findById(bookId)
    if (!book)        return res.status(404).json({ message: 'Book not found.' })
    if (book.availableCopies < 1)
      return res.status(400).json({ message: 'No copies of this book are currently available.' })

    const already = await Borrow.findOne({ book: bookId, member: member._id, status: { $in: ['borrowed', 'overdue'] } })
    if (already)
      return res.status(400).json({ message: 'You have already borrowed this book.' })

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)

    const borrow = await Borrow.create({ book: bookId, member: member._id, dueDate })

    book.availableCopies -= 1
    await book.save()

    const { default: Member } = await import('../models/Member.js')
    await Member.findByIdAndUpdate(member._id, {
      $inc: { booksCurrentlyBorrowed: 1, totalBorrowedAllTime: 1 },
    })

    const populated = await borrow.populate('book', 'title author isbn')
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
