import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppLayout } from './AppLayout'
import * as AuthContextModule from './AuthContext'

vi.mock('./AuthContext', async () => {
  const actual = await vi.importActual<typeof AuthContextModule>('./AuthContext')
  return { ...actual, useAuth: vi.fn() }
})

describe('AppLayout', () => {
  it('links to home and my allergens', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      token: 'test-token',
      signUp: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <MemoryRouter>
        <AppLayout>
          <p>content</p>
        </AppLayout>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'My allergens' })).toHaveAttribute('href', '/allergens')
  })

  it('calls logout when the button is clicked', async () => {
    const logout = vi.fn()
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      token: 'test-token',
      signUp: vi.fn(),
      login: vi.fn(),
      logout,
    })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <AppLayout>
          <p>content</p>
        </AppLayout>
      </MemoryRouter>,
    )
    await user.click(screen.getByText('Log out'))

    expect(logout).toHaveBeenCalled()
  })
})
