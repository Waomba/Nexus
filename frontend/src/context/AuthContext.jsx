import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('nexus_user') || 'null'))
  const [token, setToken]     = useState(() => localStorage.getItem('nexus_token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(r => { setUser(r.data.data); localStorage.setItem('nexus_user', JSON.stringify(r.data.data)) })
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (tok, userData) => {
    localStorage.setItem('nexus_token', tok)
    localStorage.setItem('nexus_user', JSON.stringify(userData))
    setToken(tok)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('nexus_token')
    localStorage.removeItem('nexus_user')
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'
  const isKids  = user?.is_kids === 1 || user?.is_kids === '1'

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isKids, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
