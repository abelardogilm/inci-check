import { useTranslation } from 'react-i18next'

const LANGUAGES = ['en', 'es'] as const

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage

  return (
    <div className="flex gap-1 text-sm">
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => i18n.changeLanguage(lang)}
          aria-current={current === lang}
          className={
            current === lang
              ? 'px-2 py-1 font-medium text-ink'
              : 'px-2 py-1 text-ink-muted transition-colors hover:text-ink'
          }
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
