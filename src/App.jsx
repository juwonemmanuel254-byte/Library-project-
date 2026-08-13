import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

// Librarian dashboard
import Navbar        from './components/Navbar'
import Dashboard     from './components/Dashboard'
import Catalog       from './components/Catalog'
import Members       from './components/Members'
import Borrow        from './components/Borrow'
import Return        from './components/Return'
import CreateStaff   from './components/CreateStaff'
import FirstRunSetup from './components/FirstRunSetup'

// Public portal
import LandingPage     from './portal/LandingPage'
import UnifiedLogin    from './portal/UnifiedLogin'
import MemberDashboard from './portal/MemberDashboard'

import './App.css'

/* ── Librarian / Admin dashboard ─────────────────────── */
const LibrarianApp = () => {
  const [activePage, setActivePage] = useState('dashboard')

  const renderPage = () => {
    switch (activePage) {
      case 'catalog':       return <Catalog />
      case 'members':       return <Members />
      case 'borrow':        return <Borrow />
      case 'return':        return <Return />
      case 'create-staff':  return <CreateStaff />
      default:              return <Dashboard setActivePage={setActivePage} />
    }
  }

  return (
    <>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main className="app-main">{renderPage()}</main>
    </>
  )
}

/* ── Root router ─────────────────────────────────────── */
const AppInner = () => {
  const { user, loading, needsSetup, completeSetup } = useAuth()

  // 'landing' | 'login' | 'register'
  const [view, setView] = useState('landing')

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    )
  }

  // First-run: no admin exists yet
  if (needsSetup) {
    return <FirstRunSetup onComplete={completeSetup} />
  }

  // Logged-in member
  if (user?.role === 'member') return <MemberDashboard />

  // Logged-in librarian / admin
  if (user?.role === 'librarian' || user?.role === 'admin') return <LibrarianApp />

  // ── Not logged in ─────────────────────────────────────

  // Login or Register — both handled by UnifiedLogin with defaultTab
  if (view === 'login' || view === 'register') {
    return (
      <UnifiedLogin
        defaultTab={view === 'register' ? 'register' : 'login'}
        onBack={() => setView('landing')}
      />
    )
  }

  // Default: landing page
  return (
    <LandingPage
      onLogin={()  => setView('login')}
      onSignup={() => setView('register')}
    />
  )
}

const App = () => (
  <ToastProvider>
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  </ToastProvider>
)

export default App
