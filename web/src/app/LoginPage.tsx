import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard } from '../ui/AuthCard'
import { Button } from '../ui/Button'
import { FormError } from '../ui/FormError'
import { PasswordField } from '../ui/PasswordField'
import { TextField } from '../ui/TextField'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    try {
      await login(email, password)
      navigate('/home')
    } catch {
      setError(t('auth.login.invalidCredentials'))
    }
  }

  return (
    <AuthCard title={t('auth.login.title')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <PasswordField
          label={t('auth.password')}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <Button type="submit">{t('auth.login.submit')}</Button>
      </form>
      {error && (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      )}
      <p className="mt-6 text-sm text-ink-muted">
        {t('auth.login.noAccount')}{' '}
        <Link to="/signup" className="text-ink underline underline-offset-2">
          {t('auth.login.signUpLink')}
        </Link>
      </p>
    </AuthCard>
  )
}
