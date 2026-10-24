import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { buttonBase, buttonVariants } from './ui/Button'
import { LanguageToggle } from './ui/LanguageToggle'

function App() {
  const { t } = useTranslation()
  const steps = t('landing.howItWorks.steps', { returnObjects: true }) as string[]

  return (
    <main className="relative mx-auto max-w-2xl px-6 py-16">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="text-center">
        <h1 className="text-5xl font-semibold tracking-tight">inci-check</h1>
        <p className="mt-4 text-lg text-ink-muted">{t('landing.subtitle')}</p>
      </div>

      <div className="mt-10 border border-line border-l-4 border-l-ink px-5 py-4 font-mono text-sm text-ink-muted">
        Ingredients: Aqua, Glycerin,{' '}
        <span className="border border-flag bg-flag-muted px-1 text-flag">Limonene ⚠</span>, Parfum,
        Citric Acid
      </div>

      <div className="mt-16 flex justify-center gap-3">
        <Link to="/signup" className={`${buttonBase} ${buttonVariants.primary}`}>
          {t('auth.signup.submit')}
        </Link>
        <Link to="/login" className={`${buttonBase} ${buttonVariants.ghost}`}>
          {t('auth.login.submit')}
        </Link>
      </div>

      <div className="mx-auto mt-20 max-w-md">
        <h2 className="text-xl font-semibold tracking-tight">{t('landing.howItWorks.title')}</h2>
        <ol className="mt-4 flex flex-col gap-3">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="font-mono text-ink-muted">{index + 1}</span>
              <span className="text-ink-muted">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto mt-12 max-w-md">
        <h2 className="text-xl font-semibold tracking-tight">{t('landing.why.title')}</h2>
        <p className="mt-4 text-ink-muted">{t('landing.why.body')}</p>
      </div>
    </main>
  )
}

export default App
