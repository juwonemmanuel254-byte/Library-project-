/**
 * Seed script — adds 24 realistic demo books across 6 categories
 * Run with:  node scripts/seedBooks.js
 */

import mongoose from 'mongoose'
import dotenv   from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join }  from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

import Book from '../models/Book.js'

const books = [
  // ── Fiction ──────────────────────────────────────────
  {
    title: 'Things Fall Apart',
    author: 'Chinua Achebe',
    isbn: '978-0-385-47454-2',
    category: 'Fiction',
    publisher: 'Anchor Books',
    publishedYear: 1958,
    totalCopies: 5,
    availableCopies: 5,
    description: 'A landmark novel about the life of Okonkwo, an Igbo warrior, and the arrival of European missionaries in Nigeria.',
  },
  {
    title: 'Purple Hibiscus',
    author: 'Chimamanda Ngozi Adichie',
    isbn: '978-1-61695-733-5',
    category: 'Fiction',
    publisher: 'Algonquin Books',
    publishedYear: 2003,
    totalCopies: 4,
    availableCopies: 4,
    description: 'A coming-of-age story set in post-colonial Nigeria, exploring family, faith, and freedom.',
  },
  {
    title: 'Half of a Yellow Sun',
    author: 'Chimamanda Ngozi Adichie',
    isbn: '978-1-4000-9522-2',
    category: 'Fiction',
    publisher: 'Knopf',
    publishedYear: 2006,
    totalCopies: 3,
    availableCopies: 3,
    description: 'A powerful novel set during the Nigerian Civil War, following three characters whose lives intersect.',
  },
  {
    title: 'Season of Migration to the North',
    author: 'Tayeb Salih',
    isbn: '978-0-14-118529-6',
    category: 'Fiction',
    publisher: 'Penguin Classics',
    publishedYear: 1966,
    totalCopies: 2,
    availableCopies: 2,
    description: 'A masterpiece of Arabic literature about identity, colonialism, and the clash of East and West.',
  },

  // ── Science ──────────────────────────────────────────
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    isbn: '978-0-553-38016-3',
    category: 'Science',
    publisher: 'Bantam Books',
    publishedYear: 1988,
    totalCopies: 4,
    availableCopies: 4,
    description: 'Stephen Hawking explores the universe, from the Big Bang to black holes, for the general reader.',
  },
  {
    title: 'The Selfish Gene',
    author: 'Richard Dawkins',
    isbn: '978-0-19-929115-1',
    category: 'Science',
    publisher: 'Oxford University Press',
    publishedYear: 1976,
    totalCopies: 3,
    availableCopies: 3,
    description: 'Dawkins introduces the gene-centred view of evolution and popularises the concept of the meme.',
  },
  {
    title: 'Cosmos',
    author: 'Carl Sagan',
    isbn: '978-0-345-53943-4',
    category: 'Science',
    publisher: 'Ballantine Books',
    publishedYear: 1980,
    totalCopies: 3,
    availableCopies: 3,
    description: 'A sweeping exploration of the universe and humanity\'s place in it, from one of history\'s great science communicators.',
  },
  {
    title: 'The Gene: An Intimate History',
    author: 'Siddhartha Mukherjee',
    isbn: '978-1-4767-3352-4',
    category: 'Science',
    publisher: 'Scribner',
    publishedYear: 2016,
    totalCopies: 2,
    availableCopies: 2,
    description: 'A compelling history of genetics, from Mendel\'s pea plants to CRISPR gene editing.',
  },

  // ── History ──────────────────────────────────────────
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0-06-231609-7',
    category: 'History',
    publisher: 'Harper',
    publishedYear: 2011,
    totalCopies: 6,
    availableCopies: 6,
    description: 'A bold look at the entire history of our species, from Stone Age foragers to 21st century tech empires.',
  },
  {
    title: 'The Guns of August',
    author: 'Barbara W. Tuchman',
    isbn: '978-0-345-47609-8',
    category: 'History',
    publisher: 'Ballantine Books',
    publishedYear: 1962,
    totalCopies: 2,
    availableCopies: 2,
    description: 'A gripping account of the first month of World War I and the miscalculations that set Europe ablaze.',
  },
  {
    title: 'Long Walk to Freedom',
    author: 'Nelson Mandela',
    isbn: '978-0-316-54818-4',
    category: 'History',
    publisher: 'Little, Brown',
    publishedYear: 1994,
    totalCopies: 4,
    availableCopies: 4,
    description: 'Nelson Mandela\'s autobiography — from his rural childhood to his 27 years in prison and the presidency.',
  },
  {
    title: 'The Wretched of the Earth',
    author: 'Frantz Fanon',
    isbn: '978-0-8021-5083-7',
    category: 'History',
    publisher: 'Grove Press',
    publishedYear: 1961,
    totalCopies: 2,
    availableCopies: 2,
    description: 'A seminal work on the psychology of colonialism and the process of decolonisation.',
  },

  // ── Technology ───────────────────────────────────────
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0-13-235088-4',
    category: 'Technology',
    publisher: 'Prentice Hall',
    publishedYear: 2008,
    totalCopies: 4,
    availableCopies: 4,
    description: 'A handbook of agile software craftsmanship that teaches how to write code that is readable and maintainable.',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt & David Thomas',
    isbn: '978-0-13-595705-9',
    category: 'Technology',
    publisher: 'Addison-Wesley',
    publishedYear: 1999,
    totalCopies: 3,
    availableCopies: 3,
    description: 'Timeless lessons on software development that help programmers become more effective and productive.',
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1-4493-7332-0',
    category: 'Technology',
    publisher: "O'Reilly Media",
    publishedYear: 2017,
    totalCopies: 3,
    availableCopies: 3,
    description: 'A deep dive into the principles behind reliable, scalable, and maintainable data systems.',
  },
  {
    title: 'The Innovators',
    author: 'Walter Isaacson',
    isbn: '978-1-4767-0869-0',
    category: 'Technology',
    publisher: 'Simon & Schuster',
    publishedYear: 2014,
    totalCopies: 2,
    availableCopies: 2,
    description: 'The story of the people who created the computer and the internet — from Ada Lovelace to Steve Jobs.',
  },

  // ── Business ─────────────────────────────────────────
  {
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    isbn: '978-1-58542-433-4',
    category: 'Business',
    publisher: 'TarcherPerigee',
    publishedYear: 1937,
    totalCopies: 5,
    availableCopies: 5,
    description: 'One of the best-selling self-help books of all time, outlining the philosophy of personal achievement.',
  },
  {
    title: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    isbn: '978-1-61268-116-7',
    category: 'Business',
    publisher: 'Plata Publishing',
    publishedYear: 1997,
    totalCopies: 5,
    availableCopies: 5,
    description: 'Personal finance lessons told through the contrasting financial philosophies of two father figures.',
  },
  {
    title: 'Zero to One',
    author: 'Peter Thiel',
    isbn: '978-0-8041-3929-8',
    category: 'Business',
    publisher: 'Crown Business',
    publishedYear: 2014,
    totalCopies: 3,
    availableCopies: 3,
    description: 'Notes on startups and how to build companies that create new things, not just copy what already exists.',
  },
  {
    title: 'Good to Great',
    author: 'Jim Collins',
    isbn: '978-0-06-662099-2',
    category: 'Business',
    publisher: 'HarperBusiness',
    publishedYear: 2001,
    totalCopies: 2,
    availableCopies: 2,
    description: 'A research-driven look at why some companies make the leap to greatness and others do not.',
  },

  // ── Philosophy ───────────────────────────────────────
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    isbn: '978-0-14-044140-6',
    category: 'Philosophy',
    publisher: 'Penguin Classics',
    publishedYear: 180,
    totalCopies: 4,
    availableCopies: 4,
    description: 'Private reflections of the Roman emperor and Stoic philosopher — a timeless guide to living with virtue.',
  },
  {
    title: 'Man\'s Search for Meaning',
    author: 'Viktor E. Frankl',
    isbn: '978-0-8070-1428-6',
    category: 'Philosophy',
    publisher: 'Beacon Press',
    publishedYear: 1946,
    totalCopies: 4,
    availableCopies: 4,
    description: 'A Holocaust survivor\'s account of finding purpose in suffering, and the foundation of logotherapy.',
  },
  {
    title: 'The Republic',
    author: 'Plato',
    isbn: '978-0-14-045511-3',
    category: 'Philosophy',
    publisher: 'Penguin Classics',
    publishedYear: -375,
    totalCopies: 2,
    availableCopies: 2,
    description: 'Plato\'s foundational work on justice, beauty, equality, politics, and the ideal state.',
  },
  {
    title: 'Beyond Good and Evil',
    author: 'Friedrich Nietzsche',
    isbn: '978-0-14-044923-5',
    category: 'Philosophy',
    publisher: 'Penguin Classics',
    publishedYear: 1886,
    totalCopies: 2,
    availableCopies: 2,
    description: 'Nietzsche\'s critique of past philosophers and challenge to traditional morality and religious thought.',
  },
]

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    const existing = await Book.countDocuments()
    if (existing > 0) {
      console.log(`\n${existing} book(s) already exist. Clearing and re-seeding…`)
      await Book.deleteMany({})
    }

    await Book.insertMany(books)
    console.log(`\n✓ Successfully seeded ${books.length} books across 6 categories:`)

    const categories = [...new Set(books.map((b) => b.category))]
    for (const cat of categories) {
      const count = books.filter((b) => b.category === cat).length
      console.log(`  ${cat.padEnd(14)} — ${count} books`)
    }
    console.log('')

  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected.')
  }
}

run()
