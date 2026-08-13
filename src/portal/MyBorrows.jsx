import { useEffect, useState } from 'react'
import { portalApi } from '../services/api'
import './MyBorrows.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

const statusInfo = (status) => {
  switch (status) {
    case 'borrowed': return { label: 'Borrowed',  badgeClass: 'badge-primary', icon: 'outbox'         }
    case 'overdue':  return { label: 'Overdue',   badgeClass: 'badge-danger',  icon: 'warning_amber'  }
    case 'returned': return { label: 'Returned',  badgeClass: 'badge-success', icon: 'move_to_inbox'  }
    default:         return { label: status,       badgeClass: 'badge-primary', icon: 'help'           }
  }
}

const MyBorrows = () => {
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [filter,  setFilter]  = useState('all')  // all | active | returned

  useEffect(() => {
    portalApi.getMyBorrows()
      .then(setBorrows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()

  const filtered = borrows.filter((b) => {
    if (filter === 'active')   return b.status !== 'returned'
    if (filter === 'returned') return b.status === 'returned'
    return true
  })

  const activeBorrows  = borrows.filter((b) => b.status !== 'returned').length
  const overdueBorrows = borrows.filter((b) => b.status === 'overdue').length
  const totalFines     = borrows.reduce((sum, b) => sum + (b.fine || 0), 0)

  return (
    <div className="my-borrows">

      <div className="my-borrows-header">
        <h2>My Borrows</h2>
        <p>Your full borrowing history with this library</p>
      </div>

      {/* Summary cards */}
      <div className="borrow-summary-cards">
        <div className="borrow-summary-card">
          <Icon name="outbox" size="28px" />
          <div>
            <span className="summary-value">{activeBorrows}</span>
            <span className="summary-label">Currently Borrowed</span>
          </div>
        </div>
        <div className="borrow-summary-card">
          <Icon name="warning_amber" size="28px" />
          <div>
            <span className="summary-value overdue-val">{overdueBorrows}</span>
            <span className="summary-label">Overdue</span>
          </div>
        </div>
        <div className="borrow-summary-card">
          <Icon name="history" size="28px" />
          <div>
            <span className="summary-value">{borrows.length}</span>
            <span className="summary-label">Total Borrowed</span>
          </div>
        </div>
        <div className="borrow-summary-card">
          <Icon name="payments" size="28px" />
          <div>
            <span className="summary-value fine-val">${totalFines.toFixed(2)}</span>
            <span className="summary-label">Total Fines</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <Icon name="error_outline" /> {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="borrow-filter-tabs">
        {['all', 'active', 'returned'].map((f) => (
          <button
            key={f}
            className={`borrow-filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'active' ? 'Active & Overdue' : 'Returned'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Icon name="menu_book" size="56px" /></div>
          <p>
            {filter === 'all'
              ? "You haven't borrowed any books yet. Head to Browse Catalog to get started."
              : `No ${filter} borrows found.`
            }
          </p>
        </div>
      ) : (
        <div className="borrow-cards">
          {filtered.map((b) => {
            const info      = statusInfo(b.status)
            const due       = new Date(b.dueDate)
            const isOverdue = b.status !== 'returned' && today > due
            const daysOver  = isOverdue
              ? Math.ceil((today - due) / (1000 * 60 * 60 * 24))
              : 0

            return (
              <div key={b._id} className={`borrow-card ${b.status === 'overdue' ? 'borrow-card--overdue' : ''}`}>
                <div className="borrow-card-icon">
                  <Icon name="menu_book" size="32px" />
                </div>

                <div className="borrow-card-body">
                  <div className="borrow-card-top">
                    <div>
                      <h3 className="borrow-book-title">{b.book?.title}</h3>
                      <p className="borrow-book-author">by {b.book?.author}</p>
                      <p className="borrow-book-cat">
                        <Icon name="label" /> {b.book?.category}
                      </p>
                    </div>
                    <span className={`badge ${info.badgeClass} borrow-status-badge`}>
                      <Icon name={info.icon} /> {info.label}
                    </span>
                  </div>

                  <div className="borrow-card-meta">
                    <div className="borrow-meta-item">
                      <Icon name="calendar_today" />
                      <span>Borrowed: <strong>{new Date(b.borrowDate).toDateString()}</strong></span>
                    </div>
                    <div className={`borrow-meta-item ${isOverdue ? 'text-danger' : ''}`}>
                      <Icon name="event" />
                      <span>Due: <strong>{due.toDateString()}</strong></span>
                    </div>
                    {b.returnDate && (
                      <div className="borrow-meta-item">
                        <Icon name="check_circle" />
                        <span>Returned: <strong>{new Date(b.returnDate).toDateString()}</strong></span>
                      </div>
                    )}
                  </div>

                  {isOverdue && (
                    <div className="borrow-overdue-notice">
                      <Icon name="warning_amber" />
                      <span>
                        This book is <strong>{daysOver} day{daysOver !== 1 ? 's' : ''} overdue</strong>.
                        Estimated fine: <strong>${(daysOver * 0.5).toFixed(2)}</strong>.
                        Please return it to the library desk.
                      </span>
                    </div>
                  )}

                  {b.fine > 0 && b.status === 'returned' && (
                    <div className="borrow-fine-note">
                      <Icon name="payments" />
                      <span>Fine charged: <strong>${b.fine.toFixed(2)}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyBorrows
