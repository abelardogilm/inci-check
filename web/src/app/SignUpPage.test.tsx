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

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  { password, confirmPassword }: { password: string; confirmPassword: string },
) {
  await user.type(screen.getByLabelText('Email'), 'someone@example.com')
  await user.type(screen.getByLabelText('Password'), password)
  await user.type(screen.getByLabelText('Confirm password'), confirmPassword)
}

describe('SignUpPage', () => {
  it('navigates to the home page when passwords match', async () => {
    const signUp = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderSignUpPage(signUp)

    await fillForm(user, { password: 'password123', confirmPassword: 'password123' })
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(signUp).toHaveBeenCalledWith('someone@example.com', 'password123')
    expect(await screen.findByText('home page')).toBeInTheDocument()
  })

  it("shows an error and doesn't submit when the passwords don't match", async () => {
    const signUp = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderSignUpPage(signUp)

    await fillForm(user, { password: 'password123', confirmPassword: 'somethingelse' })
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match')
    expect(signUp).not.toHaveBeenCalled()
  })

  it('shows the server error message when sign-up fails', async () => {
    const signUp = vi.fn().mockRejectedValue(new Error('Email has already been taken'))
    const user = userEvent.setup()
    renderSignUpPage(signUp)

    await fillForm(user, { password: 'short', confirmPassword: 'short' })
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email has already been taken')
  })

  it('reveals the password when the show button is clicked', async () => {
    const user = userEvent.setup()
    renderSignUpPage(vi.fn())

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getAllByRole('button', { name: 'Show' })[0])

    expect(passwordInput).toHaveAttribute('type', 'text')
  })
})
