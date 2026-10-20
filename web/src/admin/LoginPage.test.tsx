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

function renderLoginPage(login: (username: string, password: string) => Promise<void>) {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({ token: null, login, logout: vi.fn() })

  return render(
    <MemoryRouter initialEntries={['/admin/login']}>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/allergens" element={<p>allergens page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('navigates to the allergens page on a successful login', async () => {
    const login = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderLoginPage(login)

    await user.type(screen.getByLabelText('Username'), 'admin')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByText('Log in'))

    expect(login).toHaveBeenCalledWith('admin', 'secret')
    expect(await screen.findByText('allergens page')).toBeInTheDocument()
  })

  it('shows an error message when login fails', async () => {
    const login = vi.fn().mockRejectedValue(new Error('nope'))
    const user = userEvent.setup()
    renderLoginPage(login)

    await user.type(screen.getByLabelText('Username'), 'admin')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByText('Log in'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password')
  })
})
