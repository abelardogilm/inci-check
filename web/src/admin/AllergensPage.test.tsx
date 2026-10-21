import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AllergensPage } from './AllergensPage'
import * as api from './api'
import * as AuthContextModule from './AuthContext'

vi.mock('./AuthContext', async () => {
  const actual = await vi.importActual<typeof AuthContextModule>('./AuthContext')
  return { ...actual, useAuth: vi.fn() }
})

const fragrance: api.Allergen = {
  id: 1,
  name: 'Fragrance',
  aliases: [{ id: 10, name: 'parfum' }],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    token: 'test-token',
    login: vi.fn(),
    logout: vi.fn(),
  })
})

describe('AllergensPage', () => {
  it('renders allergens and their aliases fetched on mount', async () => {
    vi.spyOn(api, 'listAllergens').mockResolvedValue([fragrance])

    render(<AllergensPage />)

    expect(await screen.findByText('Fragrance')).toBeInTheDocument()
    expect(screen.getByText('parfum')).toBeInTheDocument()
  })

  it('creates a new allergen and refreshes the list', async () => {
    vi.spyOn(api, 'listAllergens').mockResolvedValueOnce([]).mockResolvedValueOnce([fragrance])
    const createSpy = vi.spyOn(api, 'createAllergen').mockResolvedValue(fragrance)
    const user = userEvent.setup()

    render(<AllergensPage />)
    await user.type(screen.getByLabelText('New allergen name'), 'Fragrance')
    await user.click(screen.getByText('Add allergen'))

    expect(createSpy).toHaveBeenCalledWith('test-token', 'Fragrance')
    expect(await screen.findByText('Fragrance')).toBeInTheDocument()
  })

  it('deletes an allergen', async () => {
    vi.spyOn(api, 'listAllergens').mockResolvedValueOnce([fragrance]).mockResolvedValueOnce([])
    const deleteSpy = vi.spyOn(api, 'deleteAllergen').mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(<AllergensPage />)
    await screen.findByText('Fragrance')
    await user.click(screen.getByText('Delete'))

    expect(deleteSpy).toHaveBeenCalledWith('test-token', 1)
  })

  it('adds an alias to an allergen', async () => {
    vi.spyOn(api, 'listAllergens').mockResolvedValue([fragrance])
    const addAliasSpy = vi.spyOn(api, 'addAlias').mockResolvedValue({ id: 11, name: 'Parfum (FR)' })
    const user = userEvent.setup()

    render(<AllergensPage />)
    await screen.findByText('Fragrance')
    await user.type(screen.getByLabelText('New alias for Fragrance'), 'Parfum (FR)')
    await user.click(screen.getByText('Add alias'))

    expect(addAliasSpy).toHaveBeenCalledWith('test-token', 1, 'Parfum (FR)')
  })

  it('removes an alias', async () => {
    vi.spyOn(api, 'listAllergens').mockResolvedValue([fragrance])
    const deleteAliasSpy = vi.spyOn(api, 'deleteAlias').mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(<AllergensPage />)
    await screen.findByText('parfum')
    await user.click(screen.getByRole('button', { name: 'Remove alias parfum' }))

    expect(deleteAliasSpy).toHaveBeenCalledWith('test-token', 1, 10)
  })
})
