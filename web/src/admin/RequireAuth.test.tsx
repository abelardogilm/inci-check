import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import * as AuthContextModule from './AuthContext'

vi.mock('./AuthContext', async () => {
  const actual = await vi.importActual<typeof AuthContextModule>('./AuthContext')
  return { ...actual, useAuth: vi.fn() }
})

function renderWithToken(token: string | null) {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    token,
    login: vi.fn(),
    logout: vi.fn(),
  })

  return render(
    <MemoryRouter initialEntries={['/admin/allergens']}>
      <Routes>
        <Route path="/admin/login" element={<p>login page</p>} />
        <Route
          path="/admin/allergens"
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
