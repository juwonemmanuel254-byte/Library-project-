import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './Login.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

const Login = () => {
  const { login } = useAuth()
  const toast     = useToast()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.warning('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-branding">
          <div className="login-logo"><Icon name="local_library" size="64px" /></div>
          <h1>LibraryMS</h1>
          <p>A complete library management system designed to make book cataloging, borrowing, and returning simple and efficient.</p>
          <ul className="login-features">
            <li><Icon name="menu_book" /> Manage your entire book catalog</li>
            <li><Icon name="group" /> Track member registrations</li>
            <li><Icon name="outbox" /> Handle borrow requests easily</li>
            <li><Icon name="move_to_inbox" /> Process returns and calculate fines</li>
            <li><Icon name="bar_chart" /> View real-time dashboard stats</li>
          </ul>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to your librarian account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-icon-wrap">
                <Icon name="email" />
                <input id="email" type="email" name="email" placeholder="librarian@library.com"
                  value={form.email} onChange={handleChange} autoComplete="email" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-icon-wrap">
                <Icon name="lock" />
                <input id="password" type="password" name="password" placeholder="Enter your password"
                  value={form.password} onChange={handleChange} autoComplete="current-password" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? <><Icon name="hourglass_top" /> Signing in…</> : <><Icon name="login" /> Sign In</>}
            </button>
          </form>

          <p className="login-note">Don&apos;t have an account? Ask your system administrator to create one.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
