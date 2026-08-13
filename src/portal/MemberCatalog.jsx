import { useEffect, useState, useCallback } from 'react'
import { booksApi, portalApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import './MemberCatalog.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

const MemberCatalog = () => {
  const toast = useToast()
  const [books,      setBooks]      = useState([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [pages,      setPages]      = useState(1)
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('')
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [borrowing,  setBorrowing]  = useState(null)

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (search)   params.append('search',   search)
      if (category) params.append('category', category)
      const data = await booksApi.getAll(params.toString())
      setBooks(data.books)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, category])

  useEffect(() => { fetchBooks() }, [fetchBooks])
  useEffect(() => { booksApi.getCategories().then(setCategories).catch(() => {}) }, [])

  const handleBorrow = async (bookId) => {
    setBorrowing(bookId)
    try {
      await portalApi.requestBorrow(bookId)
      toast.success('Book borrowed! Please collect it from the library desk.')
      fetchBooks()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBorrowing(null)
    }
  }

  return (
    <div className="member-catalog">
      <div className="member-catalog-header">
        <div>
          <h2>Browse Books</h2>
          <p>{total} book{total !== 1 ? 's' : ''} in the library</p>
        </div>
      </div>

      <div className="member-filters">
        <div className="search-input-wrap">
          <Icon name="search" />
          <input className="filter-input" placeholder="Search by title, author or ISBN…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Icon name="search_off" size="56px" /></div>
          <p>No books found for your search. Try a different keyword.</p>
        </div>
      ) : (
        <>
          <div className="member-books-grid">
            {books.map((book) => (
              <div key={book._id} className="member-book-card">
                <div className="member-book-cover">
                  <Icon name="menu_book" size="44px" />
                  <span className={`availability-badge ${book.status === 'available' ? 'avail' : 'unavail'}`}>
                    {book.status === 'available' ? `${book.availableCopies} available` : 'Unavailable'}
                  </span>
                </div>
                <div className="member-book-info">
                  <h3>{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  <p className="book-cat"><Icon name="label" /> {book.category}{book.publishedYear ? ` · ${book.publishedYear}` : ''}</p>
                  {book.description && <p className="book-desc">{book.description}</p>}
                  <button
                    className={`btn borrow-btn ${book.status === 'available' ? 'btn-primary' : 'btn-disabled'}`}
                    onClick={() => handleBorrow(book._id)}
                    disabled={book.status !== 'available' || borrowing === book._id}
                  >
                    {borrowing === book._id
                      ? <><Icon name="hourglass_top" /> Borrowing…</>
                      : book.status === 'available'
                        ? <><Icon name="outbox" /> Borrow This Book</>
                        : <><Icon name="block" /> Unavailable</>
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <Icon name="arrow_back" /> Prev
              </button>
              <span>Page {page} of {pages}</span>
              <button className="btn btn-outline" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
                Next <Icon name="arrow_forward" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MemberCatalog
