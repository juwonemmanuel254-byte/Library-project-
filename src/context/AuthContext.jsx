import { createContext, useContext, useState, useEffect } from 'react'
import { authApi, memberAuthApi } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,       setUser]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    const init = async () => {
      // Check if first-run setup is needed
      try {
        const { needsSetup: ns } = await authApi.setupStatus()
        if (ns) { setNeedsSetup(true); setLoading(false); return }
      } catch { /* server may be starting up — continue */ }

      // Re-hydrate logged-in user from stored token
      const token    = localStorage.getItem('lms_token')
      const userType = localStorage.getItem('lms_user_type')
      if (!token) { setLoading(false); return }

      const fetchFn = userType === 'member' ? memberAuthApi.getMe : authApi.getMe
      try {
        const data = await fetchFn()
        setUser({ ...data, role: userType === 'member' ? 'member' : data.role })
      } catch {
        localStorage.removeItem('lms_token')
        localStorage.removeItem('lms_user_type')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (email, password) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('lms_token',     data.token)
    localStorage.setItem('lms_user_type', 'librarian')
    setUser(data)
    return data
  }

  const memberLogin = async (email, password) => {
    const data = await memberAuthApi.login({ email, password })
    localStorage.setItem('lms_token',     data.token)
    localStorage.setItem('lms_user_type', 'member')
    setUser(data)
    return data
  }

  const memberRegister = async (formData) => {
    const data = await memberAuthApi.register(formData)
    localStorage.setItem('lms_token',     data.token)
    localStorage.setItem('lms_user_type', 'member')
    setUser(data)
    return data
  }

  const completeSetup = (userData) => {
    setNeedsSetup(false)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user_type')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, loading, needsSetup,
      login, memberLogin, memberRegister, completeSetup, logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
