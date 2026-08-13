import { useEffect, useState, useCallback } from 'react'
import { borrowsApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import './Return.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

const ConfirmReturnModal = ({ borrow, onClose, onConfirm, loading }) => {
  const dueDate       = new Date(borrow.dueDate)
  const today         = new Date()
  const isOverdue     = today > dueDate
  const daysOverdue   = isOverdue ? Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)) : 0
  const estimatedFine = parseFloat((daysOverdue * 0.5).toFixed(2))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Return</h3>
          <button className="modal-close" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="modal-body">
          <div className="return-summary">
            <div className="return-row"><span>Book</span><strong>{borrow.book?.title}</strong></div>
            <div className="return-row"><span>Member</span><strong>{borrow.member?.name} ({borrow.member?.memberId})</strong></div>
            <div className="return-row"><span>Borrowed on</span><strong>{new Date(borrow.borrowDate).toDateString()}</strong></div>
            <div className="return-row">
              <span>Due date</span>
              <strong className={isOverdue ? 'text-danger' : ''}>{dueDate.toDateString()}</strong>
            </div>
            <div className="return-row"><span>Return date</span><strong>{today.toDateString()}</strong></div>
            {isOverdue ? (
              <div className="return-fine-box overdue">
                <span><Icon name="warning_amber" /> Overdue by {daysOverdue} day{daysOverdue !== 1 ? 's' : ''}</span>
                <strong>Fine: ${estimatedFine.toFixed(2)}</strong>
              </div>
            ) : (
              <div className="return-fine-box on-time">
                <span><Icon name="check_circle" /> Returned on time — no fine applies.</span>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={onConfirm} disabled={loading}>
            {loading ? <><Icon name="hourglass_top" /> Processing…</> : <><Icon name="move_to_inbox" /> Confirm Return</>}
          </button>
        </div>
      </div>
    </div>
  )
}

const Return = () => {
  const toast = useToast()
  const [borrows,        setBorrows]        = useState([])
  const [page,           setPage]           = useState(1)
  const [pages,          setPages]          = useState(1)
  const [search,         setSearch]         = useState('')
  const [loading,        setLoading]        = useState(true)
  const [returning,      setReturning]      = useState(false)
  const [selectedBorrow, setSelectedBorrow] = useState(null)

  const fetchBorrows = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      const data = await borrowsApi.getAll(params.toString())
      setBorrows(data.borrows.filter((b) => b.status !== 'returned'))
      setPages(data.pages)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchBorrows() }, [fetchBorrows])

  const handleReturn = async () => {
    setReturning(true)
    try {
      const result = await borrowsApi.return(selectedBorrow._id)
      setSelectedBorrow(null)
      const fine = result.fine
      if (fine > 0) {
        toast.warning(`Book returned. Overdue fine applied: $${fine.toFixed(2)}`)
      } else {
        toast.success('Book returned successfully — no fine.')
      }
      fetchBorrows()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setReturning(false)
    }
  }

  const today    = new Date()
  const filtered = search
    ? borrows.filter((b) =>
        b.book?.title.toLowerCase().includes(search.toLowerCase()) ||
        b.member?.name.toLowerCase().includes(search.toLowerCase()) ||
        b.member?.memberId?.toLowerCase().includes(search.toLowerCase())
      )
    : borrows

  return (
    <div className="return-page">
      <div className="page-header container">
        <div>
          <h2>Return a Book</h2>
          <p>Process book returns and calculate overdue fines</p>
        </div>
      </div>

      <div className="container">
        <div className="return-info-banner">
          <Icon name="info" />
          <span>
            The table below shows all books currently borrowed or overdue.
            Click <strong>Return</strong> on a row to process it.
            Fines are calculated at <strong>$0.50 per day</strong> overdue.
          </span>
        </div>

        <div className="catalog-filters">
          <div className="search-input-wrap">
            <Icon name="search" />
            <input className="filter-input" placeholder="Filter by book title, member name or ID…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon name="task_alt" size="56px" /></div>
            <p>No active borrows found. All books have been returned.</p>
          </div>
        ) : (
          <div className="borrow-table-wrap">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Borrowed</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Est. Fine</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const due       = new Date(b.dueDate)
                  const isOverdue = today > due
                  const daysOver  = isOverdue ? Math.ceil((today - due) / (1000 * 60 * 60 * 24)) : 0
                  const fine      = parseFloat((daysOver * 0.5).toFixed(2))
                  return (
                    <tr key={b._id} className={isOverdue ? 'row-overdue' : ''}>
                      <td>
                        <strong>{b.book?.title}</strong>
                        <div className="sub-text">{b.book?.author}</div>
                      </td>
                      <td>
                        <strong>{b.member?.name}</strong>
                        <div className="sub-text">{b.member?.memberId}</div>
                      </td>
                      <td>{new Date(b.borrowDate).toLocaleDateString()}</td>
                      <td className={isOverdue ? 'overdue-date' : ''}>{due.toLocaleDateString()}</td>
                      <td className="center">
                        {daysOver > 0
                          ? <span className="badge badge-danger">{daysOver}d</span>
                          : <span className="badge badge-success">On time</span>
                        }
                      </td>
                      <td>{fine > 0 ? <span className="fine-amount">${fine.toFixed(2)}</span> : '—'}</td>
                      <td>
                        <button className="btn btn-success return-btn" onClick={() => setSelectedBorrow(b)}>
                          <Icon name="move_to_inbox" /> Return
                        </button>
                      </td>
                    </tr>
                  )
                })}
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

      {selectedBorrow && (
        <ConfirmReturnModal borrow={selectedBorrow} onClose={() => setSelectedBorrow(null)}
          onConfirm={handleReturn} loading={returning} />
      )}
    </div>
  )
}

export default Return
