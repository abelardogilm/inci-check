import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { PasswordField } from './PasswordField'

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
    <main>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </label>
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <button type="submit">Log in</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <p>
        No account yet? <Link to="/signup">Sign up</Link>
      </p>
    </main>
  )
}
