import { useEffect, useState, useCallback } from 'react'
import { booksApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import './Catalog.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

const emptyForm = {
  title: '', author: '', isbn: '', category: '',
  publisher: '', publishedYear: '', totalCopies: 1, description: '',
}

const BookModal = ({ book, onClose, onSave }) => {
  const toast = useToast()
  const [form,   setForm]   = useState(book || emptyForm)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.author || !form.isbn || !form.category) {
      toast.warning('Title, author, ISBN and category are required.')
      return
    }
    setSaving(true)
    try {
      if (book?._id) {
        await booksApi.update(book._id, form)
        toast.success('Book updated successfully!')
      } else {
        await booksApi.create(form)
        toast.success('Book added to the catalog!')
      }
      onSave()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{book?._id ? 'Edit Book' : 'Add New Book'}</h3>
          <button className="modal-close" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Book title" />
              </div>
              <div className="form-group">
                <label>Author *</label>
                <input name="author" value={form.author} onChange={handleChange} placeholder="Author name" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ISBN *</label>
                <input name="isbn" value={form.isbn} onChange={handleChange} placeholder="978-x-xxx-xxxxx-x" />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Science, History" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Publisher</label>
                <input name="publisher" value={form.publisher} onChange={handleChange} placeholder="Publisher name" />
              </div>
              <div className="form-group">
                <label>Published Year</label>
                <input name="publishedYear" type="number" value={form.publishedYear} onChange={handleChange} placeholder="e.g. 2021" />
              </div>
            </div>
            <div className="form-group">
              <label>Total Copies *</label>
              <input name="totalCopies" type="number" min="1" value={form.totalCopies} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" rows="3" value={form.description} onChange={handleChange} placeholder="Brief description of the book…" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : book?._id ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Catalog = () => {
  const toast = useToast()
  const [books,      setBooks]      = useState([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [pages,      setPages]      = useState(1)
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('')
  const [status,     setStatus]     = useState('')
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modalBook,  setModalBook]  = useState(undefined)
  const [deleteId,   setDeleteId]   = useState(null)

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (search)   params.append('search',   search)
      if (category) params.append('category', category)
      if (status)   params.append('status',   status)
      const data = await booksApi.getAll(params.toString())
      setBooks(data.books)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, category, status])

  useEffect(() => { fetchBooks() }, [fetchBooks])
  useEffect(() => { booksApi.getCategories().then(setCategories).catch(() => {}) }, [])

  const handleDelete = async () => {
    try {
      await booksApi.delete(deleteId)
      setDeleteId(null)
      toast.success('Book removed from catalog.')
      fetchBooks()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="catalog-page">
      <div className="page-header container">
        <div>
          <h2>Book Catalog</h2>
          <p>{total} book{total !== 1 ? 's' : ''} in the library</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalBook(null)}>
          <Icon name="add" /> Add Book
        </button>
      </div>

      <div className="container">
        <form className="catalog-filters" onSubmit={(e) => { e.preventDefault(); setPage(1); fetchBooks() }}>
          <div className="search-input-wrap">
            <Icon name="search" />
            <input className="filter-input" placeholder="Search by title, author or ISBN…"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <button type="submit" className="btn btn-primary"><Icon name="search" /> Search</button>
        </form>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon name="inbox" size="56px" /></div>
            <p>No books found. Try adjusting your search or add a new book.</p>
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <div key={book._id} className="book-card">
                <div className="book-cover"><Icon name="menu_book" size="48px" /></div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  <p className="book-meta">{book.category} · {book.publishedYear || 'N/A'}</p>
                  <p className="book-isbn">ISBN: {book.isbn}</p>
                  <div className="book-footer">
                    <span className={`badge badge-${book.status === 'available' ? 'success' : 'danger'}`}>
                      {book.status === 'available' ? `${book.availableCopies} available` : 'Unavailable'}
                    </span>
                    <div className="book-actions">
                      <button className="icon-btn" onClick={() => setModalBook(book)} title="Edit"><Icon name="edit" /></button>
                      <button className="icon-btn delete" onClick={() => setDeleteId(book._id)} title="Delete"><Icon name="delete" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>

      {modalBook !== undefined && (
        <BookModal book={modalBook} onClose={() => setModalBook(undefined)}
          onSave={() => { setModalBook(undefined); fetchBooks() }} />
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Book</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}><Icon name="close" /></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove this book from the catalog? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}><Icon name="delete_forever" /> Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Catalog
