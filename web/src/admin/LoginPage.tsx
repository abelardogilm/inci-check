import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthCard } from '../ui/AuthCard'
import { Button } from '../ui/Button'
import { FormError } from '../ui/FormError'
import { PasswordField } from '../ui/PasswordField'
import { TextField } from '../ui/TextField'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    try {
      await login(username, password)
      navigate('/admin/allergens')
    } catch {
      setError('Invalid username or password')
    }
  }

  return (
    <AuthCard title="Admin login">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
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
    </AuthCard>
  )
}
