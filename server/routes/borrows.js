import express from 'express'
import {
  getBorrows,
  getBorrowById,
  borrowBook,
  returnBook,
  getBorrowStats,
} from '../controllers/borrowController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/stats',       protect, getBorrowStats)
router.get('/',            protect, getBorrows)
router.get('/:id',         protect, getBorrowById)
router.post('/',           protect, borrowBook)
router.put('/:id/return',  protect, returnBook)

export default router
