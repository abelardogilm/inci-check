import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SignUpPage } from './SignUpPage'
import * as AuthContextModule from './AuthContext'

vi.mock('./AuthContext', async () => {
  const actual = await vi.importActual<typeof AuthContextModule>('./AuthContext')
  return { ...actual, useAuth: vi.fn() }
})

function renderSignUpPage(signUp: (email: string, password: string) => Promise<void>) {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    token: null,
    signUp,
    login: vi.fn(),
    logout: vi.fn(),
  })

  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<p>home page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SignUpPage', () => {
  it('navigates to the home page on a successful sign-up', async () => {
    const signUp = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderSignUpPage(signUp)

    await user.type(screen.getByLabelText('Email'), 'someone@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(signUp).toHaveBeenCalledWith('someone@example.com', 'password123')
    expect(await screen.findByText('home page')).toBeInTheDocument()
  })

  it('shows the server error message when sign-up fails', async () => {
    const signUp = vi.fn().mockRejectedValue(new Error('Email has already been taken'))
    const user = userEvent.setup()
    renderSignUpPage(signUp)

    await user.type(screen.getByLabelText('Email'), 'someone@example.com')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email has already been taken')
  })
})
