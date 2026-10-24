import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard } from '../ui/AuthCard'
import { Button } from '../ui/Button'
import { FormError } from '../ui/FormError'
import { PasswordField } from '../ui/PasswordField'
import { TextField } from '../ui/TextField'
import { useAuth } from './AuthContext'

export function SignUpPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t('auth.signup.passwordMismatch'))
      return
    }

    try {
      await signUp(email, password)
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.signup.genericError'))
    }
  }

  return (
    <AuthCard title={t('auth.signup.title')}>
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
          autoComplete="new-password"
        />
        <PasswordField
          label={t('auth.confirmPassword')}
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />
        <Button type="submit">{t('auth.signup.submit')}</Button>
      </form>
      {error && (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      )}
      <p className="mt-6 text-sm text-ink-muted">
        {t('auth.signup.haveAccount')}{' '}
        <Link to="/login" className="text-ink underline underline-offset-2">
          {t('auth.signup.logInLink')}
        </Link>
      </p>
    </AuthCard>
  )
}
