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
      extracted_text: ['Aqua, Limonene'],
    })
    const user = userEvent.setup()

    renderPage()
    await user.upload(screen.getByLabelText('Choose photos from library'), makeImage())
    await user.click(screen.getByRole('button', { name: 'Scan' }))

    expect(scanSpy).toHaveBeenCalledWith('test-token', [expect.objectContaining({ name: 'label.jpg' })])
    expect(await screen.findByText('Limonene')).toBeInTheDocument()
  })

  it('shows an error when the scan fails', async () => {
    vi.spyOn(api, 'submitScan').mockRejectedValue(new api.ApiError('boom'))
    const user = userEvent.setup()

    renderPage()
    await user.upload(screen.getByLabelText('Choose photos from library'), makeImage())
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
      extracted_text: ['Aqua, Glycerin'],
    })
    const user = userEvent.setup()

    renderPage()
    await user.upload(screen.getByLabelText('Choose photos from library'), makeImage())
    await user.click(screen.getByRole('button', { name: 'Scan' }))

    expect(await screen.findByText('No allergens found.')).toBeInTheDocument()
  })

  it('lets a selected photo be removed before submitting', async () => {
    const user = userEvent.setup()

    renderPage()
    await user.upload(screen.getByLabelText('Choose photos from library'), makeImage())
    expect(screen.getByRole('button', { name: 'Scan' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Remove label.jpg' }))

    expect(screen.getByRole('button', { name: 'Scan' })).toBeDisabled()
  })

  it('offers a dedicated single-shot camera input, without multiple set', () => {
    renderPage()

    const cameraInput = screen.getByLabelText('Take a photo')
    expect(cameraInput).toHaveAttribute('capture', 'environment')
    expect(cameraInput).not.toHaveAttribute('multiple')
  })

  it('adds a photo taken with the camera to the selection', async () => {
    const user = userEvent.setup()

    renderPage()
    await user.upload(screen.getByLabelText('Take a photo'), makeImage('camera-shot.jpg'))

    expect(screen.getByRole('button', { name: 'Remove camera-shot.jpg' })).toBeInTheDocument()
  })

  it('adds newly chosen photos to the ones already selected', async () => {
    const user = userEvent.setup()

    renderPage()
    const input = screen.getByLabelText('Choose photos from library')
    await user.upload(input, makeImage('one.jpg'))
    await user.upload(input, makeImage('two.jpg'))

    expect(screen.getByRole('button', { name: 'Remove one.jpg' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove two.jpg' })).toBeInTheDocument()
  })

  it('resets the form when starting a new scan', async () => {
    vi.spyOn(api, 'submitScan').mockResolvedValue({
      allergens: [],
      images_processed: 1,
      images_failed: 0,
      extracted_text: ['Aqua, Glycerin'],
    })
    const user = userEvent.setup()

    renderPage()
    await user.upload(screen.getByLabelText('Choose photos from library'), makeImage())
    await user.click(screen.getByRole('button', { name: 'Scan' }))
    await screen.findByText('No allergens found.')

    await user.click(screen.getByRole('button', { name: 'New scan' }))

    expect(screen.queryByText('No allergens found.')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove label.jpg' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Scan' })).toBeDisabled()
  })

  it('shows the extracted OCR text for debugging', async () => {
    vi.spyOn(api, 'submitScan').mockResolvedValue({
      allergens: [],
      images_processed: 1,
      images_failed: 0,
      extracted_text: ['Aqua, Glycerin'],
    })
    const user = userEvent.setup()

    renderPage()
    await user.upload(screen.getByLabelText('Choose photos from library'), makeImage())
    await user.click(screen.getByRole('button', { name: 'Scan' }))

    expect(await screen.findByText('Extracted text (debug)')).toBeInTheDocument()
    expect(screen.getByText(/Aqua, Glycerin/)).toBeInTheDocument()
  })
})
