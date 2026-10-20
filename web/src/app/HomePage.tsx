import { useCallback, useEffect, useState } from 'react'
import * as api from './api'
import { useAuth } from './AuthContext'

export function HomePage() {
  const { token, logout } = useAuth()
  const [email, setEmail] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    const profile = await api.getProfile(token!)
    setEmail(profile.email)
  }, [token])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return (
    <main>
      <h1>inci-check</h1>
      {email && <p>Logged in as {email}</p>}
      <button type="button" onClick={logout}>
        Log out
      </button>
    </main>
  )
}
