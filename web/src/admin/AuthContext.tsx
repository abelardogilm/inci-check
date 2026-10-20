import { createContext, useContext, useState, type ReactNode } from 'react'
import * as api from './api'

const STORAGE_KEY = 'admin_token'

interface AuthContextValue {
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY))

  async function login(username: string, password: string) {
    const { token: newToken } = await api.login(username, password)
    sessionStorage.setItem(STORAGE_KEY, newToken)
    setToken(newToken)
  }

  function logout() {
    if (token) {
      api.logout(token).catch(() => {
        /* logout is best-effort; the token is discarded client-side regardless */
      })
    }
    sessionStorage.removeItem(STORAGE_KEY)
    setToken(null)
  }

  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
