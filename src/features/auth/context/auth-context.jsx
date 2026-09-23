import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { fetchMe, login as loginRequest } from '@/features/auth/api/auth-api'

const TOKEN_KEY = 'ada_access'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password)
    localStorage.setItem(TOKEN_KEY, data.access)
    setToken(data.access)
    const me = await fetchMe(data.access)
    setUser(me)
    return me
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ token, user, login, logout, isAuthenticated: Boolean(token) }),
    [token, user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider')
  }
  return context
}
