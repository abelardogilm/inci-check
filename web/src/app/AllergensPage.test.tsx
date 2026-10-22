import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AllergensPage } from './AllergensPage'
import * as api from './api'
import * as AuthContextModule from './AuthContext'

vi.mock('./AuthContext', async () => {
  const actual = await vi.importActual<typeof AuthContextModule>('./AuthContext')
  return { ...actual, useAuth: vi.fn() }
})

const limonene: api.Allergen = { id: 1, name: 'Limonene' }
const linalool: api.Allergen = { id: 2, name: 'Linalool' }

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
      <AllergensPage />
    </MemoryRouter>,
  )
}

describe('AllergensPage', () => {
  it('shows allergens already on the list', async () => {
    vi.spyOn(api, 'listCatalog').mockResolvedValue([limonene, linalool])
    vi.spyOn(api, 'listMyAllergens').mockResolvedValue([limonene])

    renderPage()

    expect(await screen.findByText('Limonene')).toBeInTheDocument()
  })

  it('only offers to add catalog allergens not already on the list', async () => {
    vi.spyOn(api, 'listCatalog').mockResolvedValue([limonene, linalool])
    vi.spyOn(api, 'listMyAllergens').mockResolvedValue([limonene])

    renderPage()
    await screen.findByText('Add an allergen')

    expect(screen.getByText('Linalool')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('adds an allergen and refreshes the lists', async () => {
    vi.spyOn(api, 'listCatalog').mockResolvedValue([limonene])
    vi.spyOn(api, 'listMyAllergens').mockResolvedValueOnce([]).mockResolvedValueOnce([limonene])
    const addSpy = vi.spyOn(api, 'addMyAllergen').mockResolvedValue(limonene)
    const user = userEvent.setup()

    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Add' }))

    expect(addSpy).toHaveBeenCalledWith('test-token', limonene.id)
  })

  it('removes an allergen and refreshes the lists', async () => {
    vi.spyOn(api, 'listCatalog').mockResolvedValue([])
    vi.spyOn(api, 'listMyAllergens').mockResolvedValueOnce([limonene]).mockResolvedValueOnce([])
    const removeSpy = vi.spyOn(api, 'removeMyAllergen').mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Remove Limonene' }))

    expect(removeSpy).toHaveBeenCalledWith('test-token', limonene.id)
  })

  it('shows a message when the personal list is empty', async () => {
    vi.spyOn(api, 'listCatalog').mockResolvedValue([])
    vi.spyOn(api, 'listMyAllergens').mockResolvedValue([])

    renderPage()

    expect(await screen.findByText("You haven't added any allergens yet.")).toBeInTheDocument()
  })
})
