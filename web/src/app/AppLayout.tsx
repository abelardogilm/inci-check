import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { LanguageToggle } from '../ui/LanguageToggle'
import { Page } from '../ui/Page'
import { useAuth } from './AuthContext'

export function AppLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { logout } = useAuth()

  return (
    <Page>
      <nav className="mb-8 flex items-center justify-between border-b border-line pb-4">
        <Link to="/home" className="font-semibold tracking-tight">
          inci-check
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/home" className="text-ink-muted hover:text-ink">
            {t('nav.home')}
          </Link>
          <Link to="/scan" className="text-ink-muted hover:text-ink">
            {t('nav.scan')}
          </Link>
          <Link to="/allergens" className="text-ink-muted hover:text-ink">
            {t('nav.myAllergens')}
          </Link>
          <LanguageToggle />
          <Button variant="ghost" onClick={logout}>
            {t('nav.logOut')}
          </Button>
        </div>
      </nav>
      {children}
    </Page>
  )
}
