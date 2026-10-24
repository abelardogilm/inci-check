import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { buttonBase, buttonVariants } from './ui/Button'
import { LanguageToggle } from './ui/LanguageToggle'

const SAMPLE_INGREDIENTS = ['Limonene', 'Linalool', 'Parfum', 'Coumarin']

function App() {
  const { t } = useTranslation()

  return (
    <main className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div>
        <h1 className="text-5xl font-semibold tracking-tight">inci-check</h1>
        <p className="mt-4 text-lg text-ink-muted">{t('landing.subtitle')}</p>
      </div>

      <ul className="flex flex-wrap justify-center gap-2">
        {SAMPLE_INGREDIENTS.map((name) => (
          <li key={name} className="border border-line px-3 py-1 font-mono text-sm text-ink-muted">
            {name}
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <Link to="/signup" className={`${buttonBase} ${buttonVariants.primary}`}>
          {t('auth.signup.submit')}
        </Link>
        <Link to="/login" className={`${buttonBase} ${buttonVariants.ghost}`}>
          {t('auth.login.submit')}
        </Link>
      </div>
    </main>
  )
}

export default App
