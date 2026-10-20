import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'
import * as AuthContextModule from './AuthContext'

vi.mock('./AuthContext', async () => {
  const actual = await vi.importActual<typeof AuthContextModule>('./AuthContext')
  return { ...actual, useAuth: vi.fn() }
})

function renderLoginPage(login: (email: string, password: string) => Promise<void>) {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    token: null,
    signUp: vi.fn(),
    login,
    logout: vi.fn(),
  })

  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<p>home page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('navigates to the home page on a successful login', async () => {
    const login = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderLoginPage(login)

    await user.type(screen.getByLabelText('Email'), 'someone@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(login).toHaveBeenCalledWith('someone@example.com', 'secret')
    expect(await screen.findByText('home page')).toBeInTheDocument()
  })

  it('shows an error message when login fails', async () => {
    const login = vi.fn().mockRejectedValue(new Error('nope'))
    const user = userEvent.setup()
    renderLoginPage(login)

    await user.type(screen.getByLabelText('Email'), 'someone@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
  })

  it('reveals the password when the show button is clicked', async () => {
    const user = userEvent.setup()
    renderLoginPage(vi.fn())

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show' }))

    expect(passwordInput).toHaveAttribute('type', 'text')
  })
})
