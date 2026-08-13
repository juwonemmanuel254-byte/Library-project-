import express from 'express'
import { register, login, getMe, setupStatus, setupAdmin, staffRegister } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/setup-status',    setupStatus)
router.post('/setup',          setupAdmin)
router.post('/register',       protect, register)
router.post('/staff-register', staffRegister)
router.post('/login',          login)
router.get('/me',              protect, getMe)

export default router
