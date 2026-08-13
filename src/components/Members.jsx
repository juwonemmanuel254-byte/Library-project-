import { useEffect, useState, useCallback } from 'react'
import { membersApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import './Members.css'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

const emptyForm = { name: '', email: '', phone: '', address: '', membershipStatus: 'active' }

const MemberModal = ({ member, onClose, onSave }) => {
  const toast = useToast()
  const [form,   setForm]   = useState(member || emptyForm)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) { toast.warning('Name and email are required.'); return }
    setSaving(true)
    try {
      if (member?._id) {
        await membersApi.update(member._id, form)
        toast.success('Member details updated!')
      } else {
        await membersApi.create(form)
        toast.success('Member registered successfully!')
      }
      onSave()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{member?._id ? 'Edit Member' : 'Register New Member'}</h3>
          <button className="modal-close" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Member's full name" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+234 913 456 7893" />
              </div>
              <div className="form-group">
                <label>Membership Status</label>
                <select name="membershipStatus" value={form.membershipStatus} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea name="address" rows="2" value={form.address} onChange={handleChange} placeholder="Member's address" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : member?._id ? 'Update Member' : 'Register Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const statusBadge = (s) => {
  if (s === 'active')    return <span className="badge badge-success">Active</span>
  if (s === 'suspended') return <span className="badge badge-warning">Suspended</span>
  return                        <span className="badge badge-danger">Expired</span>
}

const Members = () => {
  const toast = useToast()
  const [members,     setMembers]     = useState([])
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [pages,       setPages]       = useState(1)
  const [search,      setSearch]      = useState('')
  const [status,      setStatus]      = useState('')
  const [loading,     setLoading]     = useState(true)
  const [modalMember, setModalMember] = useState(undefined)
  const [deleteId,    setDeleteId]    = useState(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      const data = await membersApi.getAll(params.toString())
      setMembers(data.members)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const handleDelete = async () => {
    try {
      await membersApi.delete(deleteId)
      setDeleteId(null)
      toast.success('Member removed successfully.')
      fetchMembers()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="members-page">
      <div className="page-header container">
        <div>
          <h2>Members</h2>
          <p>{total} registered member{total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalMember(null)}>
          <Icon name="person_add" /> Register Member
        </button>
      </div>

      <div className="container">
        <div className="catalog-filters">
          <div className="search-input-wrap">
            <Icon name="search" />
            <input className="filter-input" placeholder="Search by name, email or member ID…"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon name="person_off" size="56px" /></div>
            <p>No members found. Register the first member to get started.</p>
          </div>
        ) : (
          <div className="members-table-wrap">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Books Out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id}>
                    <td><code className="member-id">{m.memberId}</code></td>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.email}</td>
                    <td>{m.phone || '—'}</td>
                    <td className="center">{m.booksCurrentlyBorrowed}</td>
                    <td>{statusBadge(m.membershipStatus)}</td>
                    <td>
                      <div className="book-actions">
                        <button className="icon-btn" onClick={() => setModalMember(m)} title="Edit"><Icon name="edit" /></button>
                        <button className="icon-btn delete" onClick={() => setDeleteId(m._id)} title="Delete"><Icon name="delete" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            <button className="btn btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <Icon name="arrow_back" /> Prev
            </button>
            <span>Page {page} of {pages}</span>
            <button className="btn btn-outline" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
              Next <Icon name="arrow_forward" />
            </button>
          </div>
        )}
      </div>

      {modalMember !== undefined && (
        <MemberModal member={modalMember} onClose={() => setModalMember(undefined)}
          onSave={() => { setModalMember(undefined); fetchMembers() }} />
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Remove Member</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}><Icon name="close" /></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove this member? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}><Icon name="person_remove" /> Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Members
