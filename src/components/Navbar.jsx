import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>
    {name}
  </span>
)

const Navbar = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',    icon: 'dashboard',          roles: ['librarian','admin'] },
    { id: 'catalog',      label: 'Catalog',      icon: 'menu_book',          roles: ['librarian','admin'] },
    { id: 'members',      label: 'Members',      icon: 'group',              roles: ['librarian','admin'] },
    { id: 'borrow',       label: 'Borrow',       icon: 'outbox',             roles: ['librarian','admin'] },
    { id: 'return',       label: 'Return',       icon: 'move_to_inbox',      roles: ['librarian','admin'] },
    { id: 'create-staff', label: 'Staff',        icon: 'manage_accounts',    roles: ['admin']             },
  ].filter((item) => item.roles.includes(user?.role))

  const handleNav = (id) => {
    setActivePage(id)
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => handleNav('dashboard')}>
        <Icon name="local_library" size="30px" />
        <div className="navbar-title-group">
          <span className="navbar-title">LibraryMS</span>
          <span className="navbar-subtitle">Management System</span>
        </div>
      </div>

      <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-btn ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <Icon name={item.icon} />
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="navbar-user">
        <span className="user-info">
          <Icon name="account_circle" size="22px" />
          <span className="user-name">{user?.name}</span>
        </span>
        <button className="btn btn-outline logout-btn" onClick={logout}>
          <Icon name="logout" />
          Logout
        </button>
      </div>

      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>
    </nav>
  )
}

export default Navbar
