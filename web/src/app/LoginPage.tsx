import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard } from '../ui/AuthCard'
import { Button } from '../ui/Button'
import { FormError } from '../ui/FormError'
import { PasswordField } from '../ui/PasswordField'
import { TextField } from '../ui/TextField'
import { useAuth } from './AuthContext'

export function LoginPage() {
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
      setError('Invalid email or password')
    }
  }

  return (
    <AuthCard title="Log in">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <Button type="submit">Log in</Button>
      </form>
      {error && (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      )}
      <p className="mt-6 text-sm text-ink-muted">
        No account yet?{' '}
        <Link to="/signup" className="text-ink underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </AuthCard>
  )
}
