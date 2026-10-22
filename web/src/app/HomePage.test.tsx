import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from './HomePage'
import * as api from './api'
import * as AuthContextModule from './AuthContext'

vi.mock('./AuthContext', async () => {
  const actual = await vi.importActual<typeof AuthContextModule>('./AuthContext')
  return { ...actual, useAuth: vi.fn() }
})

beforeEach(() => {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    token: 'test-token',
    signUp: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
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

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('someone@example.com')).toBeInTheDocument()
  })
})
