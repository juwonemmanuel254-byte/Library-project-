import { useEffect, useState, useCallback } from 'react'
import { borrowsApi, booksApi, membersApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import './Borrow.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

const BorrowModal = ({ onClose, onSave }) => {
  const toast = useToast()
  const [books,    setBooks]    = useState([])
  const [members,  setMembers]  = useState([])
  const [bookId,   setBookId]   = useState('')
  const [memberId, setMemberId] = useState('')
  const [notes,    setNotes]    = useState('')
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    booksApi.getAll('status=available&limit=100').then((d) => setBooks(d.books)).catch(() => {})
    membersApi.getAll('status=active&limit=100').then((d) => setMembers(d.members)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!bookId || !memberId) { toast.warning('Please select both a book and a member.'); return }
    setSaving(true)
    try {
      await borrowsApi.borrow({ bookId, memberId, notes })
      toast.success('Book issued successfully!')
      onSave()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Issue a Book</h3>
          <button className="modal-close" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="borrow-info-box">
              <Icon name="event" />
              <span>Loan period is <strong>14 days</strong>. Due date will be <strong>{dueDate.toDateString()}</strong>.</span>
            </div>
            <div className="form-group">
              <label>Select Book *</label>
              <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
                <option value="">— Choose an available book —</option>
                {books.map((b) => (
                  <option key={b._id} value={b._id}>{b.title} — {b.author} ({b.availableCopies} copy left)</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select Member *</label>
              <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                <option value="">— Choose a member —</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name} ({m.memberId}) — {m.booksCurrentlyBorrowed} book(s) out</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes about this transaction…" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><Icon name="hourglass_top" /> Processing…</> : <><Icon name="outbox" /> Issue Book</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const statusBadge = (s) => {
  if (s === 'borrowed') return <span className="badge badge-primary">Borrowed</span>
  if (s === 'overdue')  return <span className="badge badge-danger">Overdue</span>
  return                       <span className="badge badge-success">Returned</span>
}

const Borrow = () => {
  const toast = useToast()
  const [borrows,      setBorrows]      = useState([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [pages,        setPages]        = useState(1)
  const [statusFilter, setStatusFilter] = useState('borrowed')
  const [loading,      setLoading]      = useState(true)
  const [showModal,    setShowModal]    = useState(false)

  const fetchBorrows = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (statusFilter) params.append('status', statusFilter)
      const data = await borrowsApi.getAll(params.toString())
      setBorrows(data.borrows)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchBorrows() }, [fetchBorrows])

  return (
    <div className="borrow-page">
      <div className="page-header container">
        <div>
          <h2>Borrow Management</h2>
          <p>{total} record{total !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="outbox" /> Issue a Book
        </button>
      </div>

      <div className="container">
        <div className="catalog-filters">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Records</option>
            <option value="borrowed">Currently Borrowed</option>
            <option value="overdue">Overdue</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : borrows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon name="outbox" size="56px" /></div>
            <p>No borrow records found for the selected filter.</p>
          </div>
        ) : (
          <div className="borrow-table-wrap">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                </tr>
              </thead>
              <tbody>
                {borrows.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>{b.book?.title}</strong>
                      <div className="sub-text">{b.book?.author}</div>
                    </td>
                    <td>
                      <strong>{b.member?.name}</strong>
                      <div className="sub-text">{b.member?.memberId}</div>
                    </td>
                    <td>{new Date(b.borrowDate).toLocaleDateString()}</td>
                    <td className={b.status === 'overdue' ? 'overdue-date' : ''}>
                      {new Date(b.dueDate).toLocaleDateString()}
                    </td>
                    <td>{statusBadge(b.status)}</td>
                    <td>{b.fine > 0 ? <span className="fine-amount">${b.fine.toFixed(2)}</span> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {showModal && (
        <BorrowModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchBorrows() }} />
      )}
    </div>
  )
}

export default Borrow
