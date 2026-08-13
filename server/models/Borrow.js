import mongoose from 'mongoose'

const borrowSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['borrowed', 'returned', 'overdue'],
      default: 'borrowed',
    },
    fine: {
      type: Number,
      default: 0,
    },
    finePaid: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
)

// Fine rate: $0.50 per day overdue
const FINE_PER_DAY = 0.5

// Calculate fine when returning
borrowSchema.methods.calculateFine = function () {
  if (!this.returnDate) return 0
  const due = new Date(this.dueDate)
  const returned = new Date(this.returnDate)
  if (returned <= due) return 0
  const daysOverdue = Math.ceil((returned - due) / (1000 * 60 * 60 * 24))
  return parseFloat((daysOverdue * FINE_PER_DAY).toFixed(2))
}

const Borrow = mongoose.model('Borrow', borrowSchema)
export default Borrow
