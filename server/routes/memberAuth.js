import express from 'express'
import { memberRegister, memberLogin, getMemberMe } from '../controllers/memberAuthController.js'
import { protectMember } from '../middleware/memberAuthMiddleware.js'

const router = express.Router()

router.post('/register', memberRegister)
router.post('/login',    memberLogin)
router.get('/me',        protectMember, getMemberMe)

export default router
