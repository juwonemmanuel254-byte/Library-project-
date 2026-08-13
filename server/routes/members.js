import express from 'express'
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} from '../controllers/memberController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/',     protect, getMembers)
router.get('/:id',  protect, getMemberById)
router.post('/',    protect, createMember)
router.put('/:id',  protect, updateMember)
router.delete('/:id', protect, deleteMember)

export default router
