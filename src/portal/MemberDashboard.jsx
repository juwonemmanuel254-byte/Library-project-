import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import MemberCatalog  from './MemberCatalog'
import MyBorrows      from './MyBorrows'
import './MemberDashboard.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

const MemberDashboard = () => {
  const { user, logout } = useAuth()
  const [page, setPage]  = useState('catalog') // 'catalog' | 'borrows'

  return (
    <div className="member-dashboard">

      {/* Header */}
      <header className="member-header">
        <div className="member-header-brand">
          <Icon name="local_library" size="26px" />
          <span>LibraryMS</span>
        </div>

        <nav className="member-nav">
          <button
            className={`member-nav-btn ${page === 'catalog' ? 'active' : ''}`}
            onClick={() => setPage('catalog')}
          >
            <Icon name="menu_book" /> Browse Catalog
          </button>
          <button
            className={`member-nav-btn ${page === 'borrows' ? 'active' : ''}`}
            onClick={() => setPage('borrows')}
          >
            <Icon name="history" /> My Borrows
          </button>
        </nav>

        <div className="member-header-user">
          <div className="member-avatar"><Icon name="account_circle" size="22px" /></div>
          <div className="member-user-info">
            <span className="member-user-name">{user?.name}</span>
            <span className="member-user-id">{user?.memberId}</span>
          </div>
          <button className="btn btn-outline member-logout" onClick={logout}>
            <Icon name="logout" /> Logout
          </button>
        </div>
      </header>

      {/* Welcome banner */}
      <div className="member-welcome">
        <div className="container">
          <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Browse the catalog and borrow books. You can have up to 5 books at a time for 14 days each.</p>
        </div>
      </div>

      {/* Page content */}
      <main className="member-main container">
        {page === 'catalog' ? <MemberCatalog /> : <MyBorrows />}
      </main>

    </div>
  )
}

export default MemberDashboard
