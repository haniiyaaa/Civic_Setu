import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'civic_setu_admin_token'
const USER_KEY = 'civic_setu_admin_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY)
    const uRaw = localStorage.getItem(USER_KEY)
    setToken(t || null)
    try {
      setUser(uRaw ? JSON.parse(uRaw) : null)
    } catch {
      setUser(null)
    }
    setBooting(false)
  }, [])

  const isAuthenticated = !!token
  const isAdmin = user?.role === 'admin'

  function setSession(nextToken, nextUser) {
    setToken(nextToken)
    setUser(nextUser)
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken)
    else localStorage.removeItem(TOKEN_KEY)
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    else localStorage.removeItem(USER_KEY)
  }

  function logout() {
    setSession(null, null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      booting,
      isAuthenticated,
      isAdmin,
      setSession,
      logout,
    }),
    [token, user, booting, isAuthenticated, isAdmin]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

