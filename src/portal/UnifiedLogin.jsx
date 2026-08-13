import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authApi } from '../services/api'
import './UnifiedLogin.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

/* ── Role picker shown at the top of both forms ── */
const RolePicker = ({ role, onChange }) => (
  <div className="role-picker">
    <button
      type="button"
      className={`role-pill ${role === 'member' ? 'active' : ''}`}
      onClick={() => onChange('member')}
    >
      <Icon name="person" /> Library Member
    </button>
    <button
      type="button"
      className={`role-pill ${role === 'staff' ? 'active' : ''}`}
      onClick={() => onChange('staff')}
    >
      <Icon name="badge" /> Staff / Admin
    </button>
  </div>
)

/* ════════════════════════════════════════════════
   LOGIN FORM
════════════════════════════════════════════════ */
const LoginForm = ({ onSwitchToRegister }) => {
  const { login, memberLogin } = useAuth()
  const toast = useToast()

  const [role,    setRole]    = useState('member')
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.warning('Please fill in all fields.'); return }
    setLoading(true)
    try {
      if (role === 'member') {
        await memberLogin(form.email, form.password)
        toast.success('Welcome back! Taking you to your dashboard…')
      } else {
        await login(form.email, form.password)
        toast.success('Welcome back! Taking you to the dashboard…')
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-form-heading">
        <h2>Sign In</h2>
        <p>Select your role then enter your credentials</p>
      </div>

      <RolePicker role={role} onChange={(r) => { setRole(r); }} />

      {role === 'staff' && (
        <div className="role-notice staff-notice">
          <Icon name="admin_panel_settings" />
          <span>Staff and admin accounts are managed by your administrator.</span>
        </div>
      )}

      {role === 'member' && (
        <div className="role-notice member-notice">
          <Icon name="person" />
          <span>Sign in to browse books and manage your borrows.</span>
        </div>
      )}

      <div className="form-group">
        <label>Email Address</label>
        <div className="input-icon-wrap">
          <Icon name="email" />
          <input
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            autoFocus
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
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
        {loading
          ? <><Icon name="hourglass_top" /> Signing in…</>
          : <><Icon name="login" /> Sign In as {role === 'member' ? 'Member' : 'Staff'}</>
        }
      </button>

      {role === 'member' && (
        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <button type="button" className="link-btn" onClick={onSwitchToRegister}>
            Create one free
          </button>
        </p>
      )}
    </form>
  )
}

/* ════════════════════════════════════════════════
   REGISTER FORM
════════════════════════════════════════════════ */
const RegisterForm = ({ onSwitchToLogin }) => {
  const { memberRegister } = useAuth()
  const toast = useToast()

  const [role,    setRole]    = useState('member')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', address: '', inviteCode: '',
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.warning('Name, email and password are required.')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      toast.warning('Password must be at least 6 characters.')
      return
    }
    if (role === 'staff' && !form.inviteCode) {
      toast.warning('Staff invite code is required.')
      return
    }

    setLoading(true)
    try {
      if (role === 'member') {
        await memberRegister(form)
        toast.success('Account created! Welcome to LibraryMS 🎉')
      } else {
        // Staff self-register with invite code
        const data = await authApi.staffRegister({
          name:       form.name,
          email:      form.email,
          password:   form.password,
          inviteCode: form.inviteCode,
        })
        localStorage.setItem('lms_token',     data.token)
        localStorage.setItem('lms_user_type', 'librarian')
        // Reload so AuthContext picks up the new token
        window.location.reload()
        toast.success('Staff account created! Welcome to LibraryMS.')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-form-heading">
        <h2>Create Account</h2>
        <p>Select your role to get started</p>
      </div>

      <RolePicker role={role} onChange={(r) => setRole(r)} />

      {role === 'staff' && (
        <div className="role-notice staff-notice">
          <Icon name="admin_panel_settings" />
          <span>
            Staff accounts require an <strong>invite code</strong> from your
            administrator. Ask your admin for the code before registering.
          </span>
        </div>
      )}

      {role === 'member' && (
        <div className="role-notice member-notice">
          <Icon name="person" />
          <span>Free membership borrow up to 5 books for 14 days each.</span>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Full Name *</label>
          <input name="name" placeholder="Your full name"
            value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input name="email" type="email" placeholder="your@email.com"
            value={form.email} onChange={handleChange} autoComplete="email" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Password *</label>
          <input name="password" type="password" placeholder="Min. 6 characters"
            value={form.password} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Confirm Password *</label>
          <input name="confirmPassword" type="password" placeholder="Repeat password"
            value={form.confirmPassword} onChange={handleChange} />
        </div>
      </div>

      {role === 'member' && (
        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" placeholder="+234 800 000 0000"
              value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input name="address" placeholder="Your address"
              value={form.address} onChange={handleChange} />
          </div>
        </div>
      )}

      {role === 'staff' && (
        <div className="form-group">
          <label>Staff Invite Code *</label>
          <div className="input-icon-wrap">
            <Icon name="vpn_key" />
            <input
              name="inviteCode"
              placeholder="Enter the invite code from your admin"
              value={form.inviteCode}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
        {loading
          ? <><Icon name="hourglass_top" /> Creating account…</>
          : role === 'member'
            ? <><Icon name="person_add" /> Create Member Account</>
            : <><Icon name="badge" /> Register as Staff</>
        }
      </button>

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToLogin}>
          Sign in
        </button>
      </p>
    </form>
  )
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
const UnifiedLogin = ({ onBack, defaultTab = 'login' }) => {
  const [tab, setTab] = useState(defaultTab) // 'login' | 'register'

  return (
    <div className="unified-login-page">

      {/* Left panel */}
      <div className="unified-login-left">
        <button className="back-btn" onClick={onBack}>
          <Icon name="arrow_back" /> Back to Home
        </button>

        <div className="unified-brand">
          <Icon name="local_library" size="56px" />
          <h1>LibraryMS</h1>
          <p>
            One place for everyone. Library members, librarians, and
            administrators all sign in and register here.
          </p>
        </div>

        <div className="role-cards">
          <p className="role-cards-label">Who uses this system</p>
          <div className="role-card">
            <Icon name="person" />
            <div>
              <strong>Library Members</strong>
              <span>Browse &amp; borrow books, track your loans</span>
            </div>
          </div>
          <div className="role-card">
            <Icon name="badge" />
            <div>
              <strong>Librarians</strong>
              <span>Issue &amp; return books, manage the catalog</span>
            </div>
          </div>
          <div className="role-card">
            <Icon name="admin_panel_settings" />
            <div>
              <strong>Administrators</strong>
              <span>Full system access and staff management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="unified-login-right">
        <div className="unified-login-card">

          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
            >
              <Icon name="login" /> Sign In
            </button>
            <button
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
            >
              <Icon name="person_add" /> Register
            </button>
          </div>

          {tab === 'login'
            ? <LoginForm    onSwitchToRegister={() => setTab('register')} />
            : <RegisterForm onSwitchToLogin={()    => setTab('login')}    />
          }

        </div>
      </div>
    </div>
  )
}

export default UnifiedLogin
