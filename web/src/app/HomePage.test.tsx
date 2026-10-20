import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from './HomePage'
import * as api from './api'
import * as AuthContextModule from './AuthContext'

vi.mock('./AuthContext', async () => {
  const actual = await vi.importActual<typeof AuthContextModule>('./AuthContext')
  return { ...actual, useAuth: vi.fn() }
})

const logout = vi.fn()

beforeEach(() => {
  logout.mockClear()
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    token: 'test-token',
    signUp: vi.fn(),
    login: vi.fn(),
    logout,
  })
})

describe('HomePage', () => {
  it("shows the logged-in user's email, fetched on mount", async () => {
    vi.spyOn(api, 'getProfile').mockResolvedValue({
      id: 1,
      email: 'someone@example.com',
      last_login_at: null,
      created_at: '2026-01-01T00:00:00Z',
    })

    render(<HomePage />)

    expect(await screen.findByText('someone@example.com')).toBeInTheDocument()
  })

  it('calls logout when the button is clicked', async () => {
    vi.spyOn(api, 'getProfile').mockResolvedValue({
      id: 1,
      email: 'someone@example.com',
      last_login_at: null,
      created_at: '2026-01-01T00:00:00Z',
    })
    const user = userEvent.setup()

    render(<HomePage />)
    await screen.findByText('someone@example.com')
    await user.click(screen.getByText('Log out'))

    expect(logout).toHaveBeenCalled()
  })
})
