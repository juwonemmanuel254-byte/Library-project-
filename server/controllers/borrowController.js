import Borrow from '../models/Borrow.js'
import Book from '../models/Book.js'
import Member from '../models/Member.js'

const BORROW_LIMIT = 5       // max books a member can borrow at once
const LOAN_DAYS   = 14       // default loan period in days

// GET /api/borrows
export const getBorrows = async (req, res) => {
  try {
    const { status, memberId, bookId, page = 1, limit = 12 } = req.query
    const query = {}

    if (status)   query.status   = status
    if (memberId) query.member   = memberId
    if (bookId)   query.book     = bookId

    const total = await Borrow.countDocuments(query)
    const borrows = await Borrow.find(query)
      .populate('book',   'title author isbn')
      .populate('member', 'name memberId email')
      .sort({ borrowDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ borrows, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/borrows/:id
export const getBorrowById = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id)
      .populate('book',   'title author isbn')
      .populate('member', 'name memberId email')
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' })
    res.json(borrow)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/borrows — issue a book
export const borrowBook = async (req, res) => {
  const { bookId, memberId, notes } = req.body

  try {
    const book   = await Book.findById(bookId)
    const member = await Member.findById(memberId)

    if (!book)   return res.status(404).json({ message: 'Book not found' })
    if (!member) return res.status(404).json({ message: 'Member not found' })

    if (book.availableCopies < 1) {
      return res.status(400).json({ message: 'No copies available for borrowing' })
    }
    if (member.membershipStatus !== 'active') {
      return res.status(400).json({ message: 'Member account is not active' })
    }
    if (member.booksCurrentlyBorrowed >= BORROW_LIMIT) {
      return res.status(400).json({
        message: `Member has reached the borrow limit of ${BORROW_LIMIT} books`,
      })
    }

    // Check if member already has this book
    const alreadyBorrowed = await Borrow.findOne({
      book: bookId,
      member: memberId,
      status: 'borrowed',
    })
    if (alreadyBorrowed) {
      return res.status(400).json({ message: 'Member has already borrowed this book' })
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + LOAN_DAYS)

    const borrow = await Borrow.create({ book: bookId, member: memberId, dueDate, notes })

    // Update book availability
    book.availableCopies -= 1
    await book.save()

    // Update member borrow counts
    member.booksCurrentlyBorrowed  += 1
    member.totalBorrowedAllTime    += 1
    await member.save()

    const populated = await borrow.populate([
      { path: 'book',   select: 'title author isbn' },
      { path: 'member', select: 'name memberId email' },
    ])

    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/borrows/:id/return — return a book
export const returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id)
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' })
    if (borrow.status === 'returned') {
      return res.status(400).json({ message: 'This book has already been returned' })
    }

    borrow.returnDate = new Date()
    borrow.status     = 'returned'
    borrow.fine       = borrow.calculateFine()
    await borrow.save()

    // Update book availability
    const book = await Book.findById(borrow.book)
    if (book) {
      book.availableCopies += 1
      await book.save()
    }

    // Update member borrow count
    const member = await Member.findById(borrow.member)
    if (member) {
      member.booksCurrentlyBorrowed = Math.max(0, member.booksCurrentlyBorrowed - 1)
      await member.save()
    }

    const populated = await borrow.populate([
      { path: 'book',   select: 'title author isbn' },
      { path: 'member', select: 'name memberId email' },
    ])

    res.json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/borrows/stats — dashboard summary
export const getBorrowStats = async (req, res) => {
  try {
    const now = new Date()

    // Mark overdue records
    await Borrow.updateMany(
      { status: 'borrowed', dueDate: { $lt: now } },
      { status: 'overdue' }
    )

    const [totalBorrowed, totalReturned, totalOverdue, totalBooks, totalMembers] =
      await Promise.all([
        Borrow.countDocuments({ status: 'borrowed' }),
        Borrow.countDocuments({ status: 'returned' }),
        Borrow.countDocuments({ status: 'overdue' }),
        Book.countDocuments(),
        Member.countDocuments({ membershipStatus: 'active' }),
      ])

    res.json({ totalBorrowed, totalReturned, totalOverdue, totalBooks, totalMembers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
