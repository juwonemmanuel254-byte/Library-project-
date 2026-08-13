/**
 * Reset script — clears all members, borrows and books
 * but keeps the admin User account untouched.
 *
 * Run with:  node scripts/resetDb.js
 */

import mongoose from 'mongoose'
import dotenv   from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join }  from 'path'

// Load .env from the server folder
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

import Member from '../models/Member.js'
import Borrow from '../models/Borrow.js'
import Book   from '../models/Book.js'
import User   from '../models/User.js'

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    const [members, borrows, books, users] = await Promise.all([
      Member.countDocuments(),
      Borrow.countDocuments(),
      Book.countDocuments(),
      User.countDocuments(),
    ])

    console.log('\nBefore reset:')
    console.log(`  Members : ${members}`)
    console.log(`  Borrows : ${borrows}`)
    console.log(`  Books   : ${books}`)
    console.log(`  Users   : ${users}  (admins/librarians — NOT touched)`)

    // Delete everything except User accounts
    await Promise.all([
      Member.deleteMany({}),
      Borrow.deleteMany({}),
      Book.deleteMany({}),
    ])

    const remaining = await User.find({}, 'name email role')
    console.log('\nReset complete.')
    console.log('Remaining staff accounts:')
    remaining.forEach((u) => console.log(`  [${u.role}]  ${u.name}  <${u.email}>`))
    console.log('')

  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected.')
  }
}

run()
