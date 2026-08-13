import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { authApi } from '../services/api'
import './FirstRunSetup.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

const FirstRunSetup = ({ onComplete }) => {
  const toast = useToast()
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [step,    setStep]    = useState(1) // 1 = welcome, 2 = form

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.warning('Please fill in all required fields.')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      toast.warning('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const data = await authApi.setup({
        name:     form.name,
        email:    form.email,
        password: form.password,
      })
      localStorage.setItem('lms_token',     data.token)
      localStorage.setItem('lms_user_type', 'librarian')
      toast.success('Admin account created! Welcome to LibraryMS.')
      onComplete(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="setup-page">
      <div className="setup-container">

        {/* Logo */}
        <div className="setup-logo">
          <Icon name="local_library" size="56px" />
          <span>LibraryMS</span>
        </div>

        {step === 1 && (
          <div className="setup-welcome">
            <div className="setup-welcome-icon">
              <Icon name="celebration" size="48px" />
            </div>
            <h1>Welcome to LibraryMS</h1>
            <p>
              It looks like this is your first time running the system.
              Let&apos;s get you set up by creating the first administrator account.
              This only needs to be done once.
            </p>

            <div className="setup-steps">
              <div className="setup-step-item">
                <div className="setup-step-num">1</div>
                <div>
                  <strong>Create Admin Account</strong>
                  <span>Set up your name, email and password</span>
                </div>
              </div>
              <div className="setup-step-item">
                <div className="setup-step-num">2</div>
                <div>
                  <strong>Log In Automatically</strong>
                  <span>You'll be taken to the dashboard right away</span>
                </div>
              </div>
              <div className="setup-step-item">
                <div className="setup-step-num">3</div>
                <div>
                  <strong>Add More Staff</strong>
                  <span>Create librarian accounts from the Staff tab</span>
                </div>
              </div>
            </div>

            <button className="btn btn-primary setup-start-btn" onClick={() => setStep(2)}>
              <Icon name="arrow_forward" /> Get Started
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="setup-form-wrap">
            <div className="setup-form-header">
              <button className="setup-back-link" onClick={() => setStep(1)}>
                <Icon name="arrow_back" /> Back
              </button>
              <h2>Create Administrator Account</h2>
              <p>This account will have full access to the system.</p>
            </div>

            <form onSubmit={handleSubmit} className="setup-form">
              <div className="form-group">
                <label>Your Full Name *</label>
                <div className="input-icon-wrap">
                  <Icon name="person" />
                  <input
                    name="name"
                    placeholder="e.g. James Adeyemi"
                    value={form.name}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <div className="input-icon-wrap">
                  <Icon name="email" />
                  <input
                    name="email"
                    type="email"
                    placeholder="admin@yourlibrary.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <div className="input-icon-wrap">
                    <Icon name="lock" />
                    <input
                      name="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <div className="input-icon-wrap">
                    <Icon name="lock_clock" />
                    <input
                      name="confirm"
                      type="password"
                      placeholder="Repeat password"
                      value={form.confirm}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="setup-notice">
                <Icon name="shield" />
                <span>
                  Keep these credentials safe. You can create more staff accounts
                  after logging in from the <strong>Staff</strong> tab.
                </span>
              </div>

              <button type="submit" className="btn btn-primary setup-submit" disabled={loading}>
                {loading
                  ? <><Icon name="hourglass_top" /> Creating account…</>
                  : <><Icon name="admin_panel_settings" /> Create Admin &amp; Launch</>
                }
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

export default FirstRunSetup
