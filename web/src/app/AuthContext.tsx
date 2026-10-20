import { createContext, useContext, useState, type ReactNode } from 'react'
import * as api from './api'

const STORAGE_KEY = 'app_token'

interface AuthContextValue {
  token: string | null
  signUp: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY))

  async function login(email: string, password: string) {
    const { token: newToken } = await api.login(email, password)
    sessionStorage.setItem(STORAGE_KEY, newToken)
    setToken(newToken)
  }

  async function signUp(email: string, password: string) {
    // Sign-up doesn't issue a token itself, so log in right after with the
    // same credentials rather than making the user do it twice.
    await api.signUp(email, password)
    await login(email, password)
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

  return (
    <AuthContext.Provider value={{ token, signUp, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
