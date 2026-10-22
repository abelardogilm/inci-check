import { useCallback, useEffect, useState } from 'react'
import * as api from './api'
import { AppLayout } from './AppLayout'
import { useAuth } from './AuthContext'

export function HomePage() {
  const { token } = useAuth()
  const [email, setEmail] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    const profile = await api.getProfile(token!)
    setEmail(profile.email)
  }, [token])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return (
    <AppLayout>
      <h1 className="text-3xl font-semibold tracking-tight">inci-check</h1>
      {email && (
        <p className="mt-2 text-ink-muted">
          Logged in as <span className="font-mono text-ink">{email}</span>
        </p>
      )}
    </AppLayout>
  )
}
