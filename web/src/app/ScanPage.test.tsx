import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from './api'
import * as AuthContextModule from './AuthContext'
import { ScanPage } from './ScanPage'

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

function renderPage() {
  return render(
    <MemoryRouter>
      <ScanPage />
    </MemoryRouter>,
  )
}

function makeImage(name = 'label.jpg') {
  return new File(['fake image bytes'], name, { type: 'image/jpeg' })
}

describe('ScanPage', () => {
  it('disables the scan button until a photo is selected', () => {
    renderPage()

    expect(screen.getByRole('button', { name: 'Scan' })).toBeDisabled()
  })

  it('submits the selected photos and shows the result', async () => {
    const scanSpy = vi.spyOn(api, 'submitScan').mockResolvedValue({
      allergens: [{ id: 1, name: 'Limonene', in_my_list: true }],
      images_processed: 1,
      images_failed: 0,
    })
    const user = userEvent.setup()

    renderPage()
    await user.upload(screen.getByLabelText('Label photos'), makeImage())
    await user.click(screen.getByRole('button', { name: 'Scan' }))

    expect(scanSpy).toHaveBeenCalledWith('test-token', [expect.objectContaining({ name: 'label.jpg' })])
    expect(await screen.findByText('Limonene')).toBeInTheDocument()
  })

  it('shows an error when the scan fails', async () => {
    vi.spyOn(api, 'submitScan').mockRejectedValue(new api.ApiError('boom'))
    const user = userEvent.setup()

    renderPage()
    await user.upload(screen.getByLabelText('Label photos'), makeImage())
    await user.click(screen.getByRole('button', { name: 'Scan' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not process the submitted photos. Try again.',
    )
  })

  it('shows a message when no allergens are found', async () => {
    vi.spyOn(api, 'submitScan').mockResolvedValue({
      allergens: [],
      images_processed: 1,
      images_failed: 0,
    })
    const user = userEvent.setup()

    renderPage()
    await user.upload(screen.getByLabelText('Label photos'), makeImage())
    await user.click(screen.getByRole('button', { name: 'Scan' }))

    expect(await screen.findByText('No allergens found.')).toBeInTheDocument()
  })
})
