import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PasswordField } from './PasswordField'

describe('PasswordField', () => {
  it('starts masked and toggles to plain text on "Show"', async () => {
    const user = userEvent.setup()
    render(
      <PasswordField
        label="Password"
        value="secret"
        onChange={vi.fn()}
        autoComplete="new-password"
      />,
    )

    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show' }))
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Hide' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('calls onChange with the typed value', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <PasswordField label="Password" value="" onChange={onChange} autoComplete="new-password" />,
    )

    await user.type(screen.getByLabelText('Password'), 'a')

    expect(onChange).toHaveBeenCalledWith('a')
  })
})
