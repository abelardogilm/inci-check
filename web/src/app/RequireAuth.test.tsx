import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { RequireAuth } from './RequireAuth'
import * as AuthContextModule from './AuthContext'

vi.mock('./AuthContext', async () => {
  const actual = await vi.importActual<typeof AuthContextModule>('./AuthContext')
  return { ...actual, useAuth: vi.fn() }
})

function renderWithToken(token: string | null) {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    token,
    signUp: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  })

  return render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route path="/login" element={<p>login page</p>} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <p>protected content</p>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  it('renders children when a token is present', () => {
    renderWithToken('abc123')
    expect(screen.getByText('protected content')).toBeInTheDocument()
  })

  it('redirects to the login page when there is no token', () => {
    renderWithToken(null)
    expect(screen.getByText('login page')).toBeInTheDocument()
  })
})
