import Book from '../models/Book.js'

// GET /api/books — get all books with optional search & filter
export const getBooks = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 12 } = req.query
    const query = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ]
    }
    if (category) query.category = { $regex: category, $options: 'i' }
    if (status) query.status = status

    const total = await Book.countDocuments(query)
    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({
      books,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/books/:id
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: 'Book not found' })
    res.json(book)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/books
export const createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body)
    res.status(201).json(book)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A book with this ISBN already exists' })
    }
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/books/:id
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!book) return res.status(404).json({ message: 'Book not found' })
    res.json(book)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/books/:id
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id)
    if (!book) return res.status(404).json({ message: 'Book not found' })
    res.json({ message: 'Book removed successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/books/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category')
    res.json(categories)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
