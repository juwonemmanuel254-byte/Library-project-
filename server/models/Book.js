import mongoose from 'mongoose'

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    publisher: {
      type: String,
      trim: true,
    },
    publishedYear: {
      type: Number,
    },
    totalCopies: {
      type: Number,
      required: true,
      min: [1, 'Must have at least one copy'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      default: function () {
        return this.totalCopies
      },
    },
    description: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'available',
    },
  },
  { timestamps: true }
)

// Auto-update status based on available copies
bookSchema.pre('save', function (next) {
  this.status = this.availableCopies > 0 ? 'available' : 'unavailable'
  next()
})

const Book = mongoose.model('Book', bookSchema)
export default Book
