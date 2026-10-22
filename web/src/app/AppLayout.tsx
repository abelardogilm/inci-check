import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Page } from '../ui/Page'
import { useAuth } from './AuthContext'

export function AppLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth()

  return (
    <Page>
      <nav className="mb-8 flex items-center justify-between border-b border-line pb-4">
        <Link to="/home" className="font-semibold tracking-tight">
          inci-check
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/home" className="text-ink-muted hover:text-ink">
            Home
          </Link>
          <Link to="/scan" className="text-ink-muted hover:text-ink">
            Scan
          </Link>
          <Link to="/allergens" className="text-ink-muted hover:text-ink">
            My allergens
          </Link>
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </div>
      </nav>
      {children}
    </Page>
  )
}
