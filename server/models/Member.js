import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    memberId: {
      type: String,
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    membershipStatus: {
      type: String,
      enum: ['active', 'suspended', 'expired'],
      default: 'active',
    },
    booksCurrentlyBorrowed: {
      type: Number,
      default: 0,
    },
    totalBorrowedAllTime: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

// Auto-generate a member ID before saving
memberSchema.pre('save', async function (next) {
  if (!this.memberId) {
    const count = await mongoose.model('Member').countDocuments()
    this.memberId = `LIB-${String(count + 1).padStart(4, '0')}`
  }
  // Hash password if it was set/modified
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }
  next()
})

memberSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const Member = mongoose.model('Member', memberSchema)
export default Member
