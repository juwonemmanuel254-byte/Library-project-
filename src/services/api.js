// API base URL — uses VITE_API_URL env var in production (set on Vercel)
// Falls back to localhost for local development only
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getHeaders = () => {
  const token = localStorage.getItem('lms_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const handleResponse = async (res) => {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  login:          (body) => fetch(`${BASE_URL}/auth/login`,           { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  register:       (body) => fetch(`${BASE_URL}/auth/register`,        { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  staffRegister:  (body) => fetch(`${BASE_URL}/auth/staff-register`,  { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getMe:          ()     => fetch(`${BASE_URL}/auth/me`,              { headers: getHeaders() }).then(handleResponse),
  setupStatus:    ()     => fetch(`${BASE_URL}/auth/setup-status`,    { headers: getHeaders() }).then(handleResponse),
  setup:          (body) => fetch(`${BASE_URL}/auth/setup`,           { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
}

// ── Books ─────────────────────────────────────────────
export const booksApi = {
  getAll:      (params = '') => fetch(`${BASE_URL}/books?${params}`,     { headers: getHeaders() }).then(handleResponse),
  getById:     (id)          => fetch(`${BASE_URL}/books/${id}`,         { headers: getHeaders() }).then(handleResponse),
  getCategories: ()          => fetch(`${BASE_URL}/books/categories`,    { headers: getHeaders() }).then(handleResponse),
  create:      (body)        => fetch(`${BASE_URL}/books`,               { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  update:      (id, body)    => fetch(`${BASE_URL}/books/${id}`,         { method: 'PUT',  headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  delete:      (id)          => fetch(`${BASE_URL}/books/${id}`,         { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
}

// ── Members ───────────────────────────────────────────
export const membersApi = {
  getAll:   (params = '') => fetch(`${BASE_URL}/members?${params}`,  { headers: getHeaders() }).then(handleResponse),
  getById:  (id)          => fetch(`${BASE_URL}/members/${id}`,      { headers: getHeaders() }).then(handleResponse),
  create:   (body)        => fetch(`${BASE_URL}/members`,            { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  update:   (id, body)    => fetch(`${BASE_URL}/members/${id}`,      { method: 'PUT',  headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  delete:   (id)          => fetch(`${BASE_URL}/members/${id}`,      { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
}

// ── Member Auth (public portal) ───────────────────────
export const memberAuthApi = {
  register: (body) => fetch(`${BASE_URL}/member-auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  login:    (body) => fetch(`${BASE_URL}/member-auth/login`,    { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getMe:    ()     => fetch(`${BASE_URL}/member-auth/me`,       { headers: getHeaders() }).then(handleResponse),
}

// ── Member Portal ─────────────────────────────────────
export const portalApi = {
  getMyBorrows:   ()       => fetch(`${BASE_URL}/portal/my-borrows`,      { headers: getHeaders() }).then(handleResponse),
  requestBorrow:  (bookId) => fetch(`${BASE_URL}/portal/request-borrow`,  { method: 'POST', headers: getHeaders(), body: JSON.stringify({ bookId }) }).then(handleResponse),
}
export const borrowsApi = {
  getAll:    (params = '') => fetch(`${BASE_URL}/borrows?${params}`,       { headers: getHeaders() }).then(handleResponse),
  getById:   (id)          => fetch(`${BASE_URL}/borrows/${id}`,           { headers: getHeaders() }).then(handleResponse),
  getStats:  ()            => fetch(`${BASE_URL}/borrows/stats`,           { headers: getHeaders() }).then(handleResponse),
  borrow:    (body)        => fetch(`${BASE_URL}/borrows`,                 { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  return:    (id)          => fetch(`${BASE_URL}/borrows/${id}/return`,    { method: 'PUT',  headers: getHeaders() }).then(handleResponse),
}
