import express from 'express'
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
} from '../controllers/bookController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.get('/', getBooks)
router.get('/categories', getCategories)
router.get('/:id', getBookById)

// Protected routes (librarian must be logged in)
router.post('/', protect, createBook)
router.put('/:id', protect, updateBook)
router.delete('/:id', protect, deleteBook)

export default router
