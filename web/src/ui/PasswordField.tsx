import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface PasswordFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
}

export function PasswordField({ label, value, onChange, autoComplete }: PasswordFieldProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  return (
    <label className="flex flex-col gap-1 text-sm text-ink-muted">
      {label}
      <span className="flex items-stretch gap-2">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 border border-line bg-paper px-3 py-2 font-mono text-base text-ink outline-none transition-colors focus:border-ink"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="shrink-0 border border-line px-3 text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink"
        >
          {visible ? t('auth.hide') : t('auth.show')}
        </button>
      </span>
    </label>
  )
}
