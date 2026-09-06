import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loginUser, registerUser } from '../api/authApi'
import { registerUnauthorizedHandler } from '../api/axios'

const AuthContext = createContext(null)

const TOKEN_KEY = 'aic_token'
const USER_KEY = 'aic_user'

// Decodes a JWT payload without any external library.
function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const persistSession = useCallback((jwt, userInfo) => {
    localStorage.setItem(TOKEN_KEY, jwt)
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    setToken(jwt)
    setUser(userInfo)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const logout = useCallback(
    ({ silent = false, redirect = true } = {}) => {
      clearSession()
      if (!silent) toast('You have been signed out.')
      if (redirect) navigate('/login', { replace: true })
    },
    [clearSession, navigate]
  )

  // Any 401 from the API layer routes back here, with no import cycle.
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      if (localStorage.getItem(TOKEN_KEY)) {
        clearSession()
        toast.error('Your session has expired. Please sign in again.')
        navigate('/login', { replace: true })
      }
    })
  }, [clearSession, navigate])

  const login = useCallback(
    async (credentials) => {
      setLoading(true)
      try {
        const { data } = await loginUser(credentials)
        // Backend is expected to return an access token; role/user info
        // is derived from the JWT claims when the backend doesn't send
        // a separate user object.
        const jwt = data.access_token || data.token
        const claims = decodeToken(jwt) || {}
        const userInfo = data.user || {
          email: claims.sub || credentials.email,
          role: claims.role || data.role || 'student',
        }
        persistSession(jwt, userInfo)
        return userInfo
      } finally {
        setLoading(false)
      }
    },
    [persistSession]
  )

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      const { data } = await registerUser(payload)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      role: user?.role || null,
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
