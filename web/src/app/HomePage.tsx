import { useCallback, useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Page } from '../ui/Page'
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
    <Page>
      <h1 className="text-3xl font-semibold tracking-tight">inci-check</h1>
      {email && (
        <p className="mt-2 text-ink-muted">
          Logged in as <span className="font-mono text-ink">{email}</span>
        </p>
      )}
      <Button variant="ghost" className="mt-6" onClick={logout}>
        Log out
      </Button>
    </Page>
  )
}
