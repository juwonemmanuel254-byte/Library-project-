import { useEffect, useState } from 'react'
import { borrowsApi } from '../services/api'
import './Dashboard.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>
    {name}
  </span>
)

const StatCard = ({ icon, label, value, color }) => (
  <div className={`stat-card stat-card--${color}`}>
    <div className="stat-icon">
      <Icon name={icon} size="32px" />
    </div>
    <div className="stat-info">
      <span className="stat-value">{value ?? '—'}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
)

const Dashboard = ({ setActivePage }) => {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    borrowsApi.getStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div className="dashboard-hero-text">
          <h1>Library Management System</h1>
          <p>
          A centralized platform for managing your library&apos;s books, members,
          and lending process. All in one place.
        </p>
        </div>
        <div className="dashboard-hero-icon">
          <Icon name="local_library" size="96px" />
        </div>
      </div>

      {error && <div className="alert alert-error container">{error}</div>}

      <div className="container">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="stats-grid">
            <StatCard icon="menu_book"      label="Total Books"        value={stats?.totalBooks}    color="blue"   />
            <StatCard icon="group"          label="Active Members"     value={stats?.totalMembers}  color="green"  />
            <StatCard icon="outbox"         label="Currently Borrowed" value={stats?.totalBorrowed} color="yellow" />
            <StatCard icon="move_to_inbox"  label="Returned"           value={stats?.totalReturned} color="teal"   />
            <StatCard icon="warning_amber"  label="Overdue"            value={stats?.totalOverdue}  color="red"    />
          </div>
        )}

        <div className="dashboard-sections">
          <h2 className="ds-title">What would you like to do?</h2>
          <div className="quick-actions">
            <button className="action-card" onClick={() => setActivePage('catalog')}>
              <span className="action-icon"><Icon name="menu_book" size="36px" /></span>
              <h3>Book Catalog</h3>
              <p>Add, search, edit and manage all books in the library collection.</p>
            </button>
            <button className="action-card" onClick={() => setActivePage('members')}>
              <span className="action-icon"><Icon name="group" size="36px" /></span>
              <h3>Members</h3>
              <p>Register new members, view profiles, and manage membership status.</p>
            </button>
            <button className="action-card" onClick={() => setActivePage('borrow')}>
              <span className="action-icon"><Icon name="outbox" size="36px" /></span>
              <h3>Issue a Book</h3>
              <p>Process a borrow request and assign a book to a member.</p>
            </button>
            <button className="action-card" onClick={() => setActivePage('return')}>
              <span className="action-icon"><Icon name="move_to_inbox" size="36px" /></span>
              <h3>Return a Book</h3>
              <p>Process book returns, calculate overdue fines, and update availability.</p>
            </button>
          </div>
        </div>

        <div className="about-section">
          <h2>About This System</h2>
          <div className="about-grid">
            <div className="about-card">
              <h3><Icon name="list_alt" /> Book Cataloging</h3>
              <p>
                Every book is cataloged with its title, author, ISBN, category,
                publisher, publication year, and number of copies. The system
                automatically tracks availability as books are borrowed and returned.
              </p>
            </div>
            <div className="about-card">
              <h3><Icon name="autorenew" /> Borrowing Process</h3>
              <p>
                Members can borrow up to five books at a time. Each loan has a
                fourteen-day period. The system verifies availability, checks
                membership status, and prevents duplicate borrowing instantly.
              </p>
            </div>
            <div className="about-card">
              <h3><Icon name="undo" /> Returning Process</h3>
              <p>
                When a book is returned, the system marks it available again and
                calculates any overdue fine at $0.50 per day. All transaction
                history is stored for auditing and reporting.
              </p>
            </div>
            <div className="about-card">
              <h3><Icon name="manage_accounts" /> Member Management</h3>
              <p>
                Each member gets a unique library ID upon registration. Librarians
                can track borrowing history, manage membership status, and suspend
                or reactivate accounts when needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
