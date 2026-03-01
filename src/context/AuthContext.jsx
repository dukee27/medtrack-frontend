import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi, register as registerApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  // Hydrate user from localStorage on mount (runs once, synchronously-ish)
  useEffect(() => {
    try {
      const token = localStorage.getItem('token')
      const stored = localStorage.getItem('user')
      if (token && stored) {
        setUser(JSON.parse(stored))
      } else {
        // No valid session — clear any stale data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setInitializing(false)
    }
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await loginApi({ email, password })
      const token = res.data.data.accessToken
      localStorage.setItem('token', token)
      const userData = { email }
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed. Check your email and password.' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    setLoading(true)
    try {
      await registerApi(data)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUserCache = (data) => {
    const updated = { ...user, ...data }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }

  // Don't render routes until we've checked localStorage — prevents flash redirect
  if (initializing) return null

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserCache }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
