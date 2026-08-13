import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './MemberAuth.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

const MemberAuth = ({ defaultTab = 'login', onBack }) => {
  const { memberLogin, memberRegister } = useAuth()
  const toast = useToast()
  const [tab,     setTab]     = useState(defaultTab)
  const [loading, setLoading] = useState(false)

  const [loginForm,  setLoginForm]  = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: '',
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      toast.warning('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      await memberLogin(loginForm.email, loginForm.password)
      toast.success('Welcome back! Taking you to your dashboard…')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const { name, email, password, confirmPassword } = signupForm
    if (!name || !email || !password) { toast.warning('Name, email and password are required.'); return }
    if (password !== confirmPassword)  { toast.error('Passwords do not match.'); return }
    if (password.length < 6)           { toast.warning('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await memberRegister(signupForm)
      toast.success('Account created! Welcome to LibraryMS 🎉')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="member-auth-page">

      {/* ── Left decorative panel ── */}
      <div className="member-auth-left">
        <button className="back-btn" onClick={onBack}>
          <Icon name="arrow_back" /> Back to Home
        </button>

        <div className="auth-brand-icon">
          <Icon name="local_library" size="60px" />
        </div>

        <h1>Create an Account</h1>

        <p>
          Join your library&apos;s digital platform and start borrowing
          books today. Membership is completely free.
        </p>

        <ul className="auth-features">
          <li><Icon name="check_circle" /> Free membership</li>
          <li><Icon name="check_circle" /> Borrow up to 5 books at once</li>
          <li><Icon name="check_circle" /> 14-day loan period per book</li>
          <li><Icon name="check_circle" /> Track your full borrow history</li>
        </ul>

        <div className="auth-already-have">
          <p>Already have an account?</p>
          <button className="btn btn-outline auth-signin-btn" onClick={onBack}>
            <Icon name="login" /> Sign In Instead
          </button>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="member-auth-right">
        <div className="member-auth-card">

          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
            >
              <Icon name="login" /> Sign In
            </button>
            <button
              className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => setTab('signup')}
            >
              <Icon name="person_add" /> Create Account
            </button>
          </div>

          {/* ── Login form ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <h2>Welcome back</h2>
              <p className="auth-subtitle">Sign in to your member account</p>

              <div className="form-group">
                <label>Email address</label>
                <div className="input-icon-wrap">
                  <Icon name="email" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-icon-wrap">
                  <Icon name="lock" />
                  <input
                    type="password"
                    placeholder="Your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading
                  ? <><Icon name="hourglass_top" /> Signing in…</>
                  : <><Icon name="login" /> Sign In</>
                }
              </button>

              <p className="auth-switch">
                Don&apos;t have an account?{' '}
                <button type="button" className="link-btn" onClick={() => setTab('signup')}>
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* ── Signup form ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="auth-form">
              <h2>Create your account</h2>
              <p className="auth-subtitle">Join the library and start borrowing today</p>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    placeholder="Your full name"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    placeholder="+234 800 000 0000"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    placeholder="Your address"
                    value={signupForm.address}
                    onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading
                  ? <><Icon name="hourglass_top" /> Creating account…</>
                  : <><Icon name="person_add" /> Create Account</>
                }
              </button>

              <p className="auth-switch">
                Already have an account?{' '}
                <button type="button" className="link-btn" onClick={() => setTab('login')}>
                  Sign in
                </button>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

export default MemberAuth
