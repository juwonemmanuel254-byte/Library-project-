import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authApi } from '../services/api'
import './CreateStaff.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

const emptyForm = { name: '', email: '', password: '', confirmPassword: '', role: 'librarian' }

const CreateStaff = () => {
  const { user } = useAuth()
  const toast    = useToast()
  const [form,    setForm]    = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState([])

  // Only admins can access this page
  if (user?.role !== 'admin') {
    return (
      <div className="create-staff-page">
        <div className="container">
          <div className="access-denied">
            <Icon name="lock" size="48px" />
            <h2>Access Denied</h2>
            <p>Only administrators can create staff accounts.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.warning('Name, email and password are all required.')
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

    setLoading(true)
    try {
      const newUser = await authApi.register({
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role,
      })
      toast.success(`${form.role === 'admin' ? 'Admin' : 'Librarian'} account created for ${form.name}! A welcome email has been sent to ${form.email}.`)
      setCreated((prev) => [...prev, newUser])
      setForm(emptyForm)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-staff-page">
      <div className="page-header container">
        <div>
          <h2>Create Staff Account</h2>
          <p>Add new librarian or admin accounts to the system</p>
        </div>
      </div>

      <div className="container create-staff-body">

        {/* ── Left: Form card ── */}
        <div className="create-staff-form-card card">
          <div className="create-staff-form-header">
            <Icon name="manage_accounts" />
            <div>
              <h3>New Staff Account</h3>
              <p>Fill in the details below to create a librarian or admin account.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="create-staff-form">

            <p className="form-section-label">Personal Details</p>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Staff member's full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="staff@library.com"
                />
              </div>
            </div>

            <p className="form-section-label">Set Password</p>
            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <p className="form-section-label">Account Role</p>
            <div className="role-selector">
              <label className={`role-option ${form.role === 'librarian' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="librarian"
                  checked={form.role === 'librarian'}
                  onChange={handleChange}
                />
                <Icon name="badge" />
                <div>
                  <strong>Librarian</strong>
                  <span>Can manage books, members, borrows and returns</span>
                </div>
              </label>

              <label className={`role-option ${form.role === 'admin' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={form.role === 'admin'}
                  onChange={handleChange}
                />
                <Icon name="admin_panel_settings" />
                <div>
                  <strong>Administrator</strong>
                  <span>Full access including creating other staff accounts</span>
                </div>
              </label>
            </div>

            <div className="create-staff-actions">
              <button type="button" className="btn btn-outline" onClick={() => setForm(emptyForm)}>
                <Icon name="refresh" /> Clear Form
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? <><Icon name="hourglass_top" /> Creating…</>
                  : <><Icon name="person_add" /> Create Account</>
                }
              </button>
            </div>
          </form>
        </div>

        {/* ── Right: Info box ── */}
        <div className="staff-info-box">
          <div className="staff-info-box-icon">
            <Icon name="info" />
          </div>
          <div>
            <strong>How staff accounts work</strong>
            <p>
              Staff members log in through the same Sign In page as library
              members. The system automatically detects their role and routes
              them to the correct dashboard. Members are never shown the
              librarian interface.
            </p>
          </div>
        </div>

        {/* ── Right: Recently created ── */}
        {created.length > 0 && (
          <div className="created-accounts card">
            <h3>
              <Icon name="check_circle" /> Created This Session
            </h3>
            <div className="created-list">
              {created.map((u) => (
                <div key={u._id} className="created-item">
                  <div className="created-avatar">
                    <Icon name={u.role === 'admin' ? 'admin_panel_settings' : 'badge'} />
                  </div>
                  <div className="created-info">
                    <strong>{u.name}</strong>
                    <span>{u.email}</span>
                  </div>
                  <span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default CreateStaff
