import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from './api'
import { AuthProvider, useAuth } from './AuthContext'

function TestConsumer() {
  const { token, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="token">{token ?? 'none'}</span>
      <button onClick={() => login('admin', 'secret')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with no token when sessionStorage is empty', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    expect(screen.getByTestId('token')).toHaveTextContent('none')
  })

  it('stores the token in sessionStorage after a successful login', async () => {
    vi.spyOn(api, 'login').mockResolvedValue({ token: 'abc123' })
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )
    await act(() => user.click(screen.getByText('login')))

    expect(screen.getByTestId('token')).toHaveTextContent('abc123')
    expect(sessionStorage.getItem('admin_token')).toBe('abc123')
  })

  it('clears the token on logout', async () => {
    vi.spyOn(api, 'login').mockResolvedValue({ token: 'abc123' })
    vi.spyOn(api, 'logout').mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )
    await act(() => user.click(screen.getByText('login')))
    await act(() => user.click(screen.getByText('logout')))

    expect(screen.getByTestId('token')).toHaveTextContent('none')
    expect(sessionStorage.getItem('admin_token')).toBeNull()
  })
})
