import { useCallback, useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import * as api from './api'
import { AppLayout } from './AppLayout'
import { useAuth } from './AuthContext'

export function AllergensPage() {
  const { token } = useAuth()
  const [catalog, setCatalog] = useState<api.Allergen[]>([])
  const [mine, setMine] = useState<api.Allergen[]>([])

  const refresh = useCallback(async () => {
    const [catalogResult, mineResult] = await Promise.all([
      api.listCatalog(token!),
      api.listMyAllergens(token!),
    ])
    setCatalog(catalogResult)
    setMine(mineResult)
  }, [token])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleAdd(allergenId: number) {
    await api.addMyAllergen(token!, allergenId)
    await refresh()
  }

  async function handleRemove(allergenId: number) {
    await api.removeMyAllergen(token!, allergenId)
    await refresh()
  }

  const myIds = new Set(mine.map((allergen) => allergen.id))
  const addable = catalog.filter((allergen) => !myIds.has(allergen.id))

  return (
    <AppLayout>
      <h1 className="text-3xl font-semibold tracking-tight">My allergens</h1>
      <p className="mt-2 text-ink-muted">A scan flags anything on this list it finds on a label.</p>

      {mine.length === 0 ? (
        <p className="mt-6 text-ink-muted">You haven&apos;t added any allergens yet.</p>
      ) : (
        <ul className="mt-6 flex flex-wrap gap-2">
          {mine.map((allergen) => (
            <li
              key={allergen.id}
              className="flex items-center gap-2 border border-line px-3 py-1 font-mono text-sm text-ink-muted"
            >
              {allergen.name}
              <button
                type="button"
                onClick={() => handleRemove(allergen.id)}
                aria-label={`Remove ${allergen.name}`}
                className="text-ink-muted transition-colors hover:text-flag"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-xl font-semibold tracking-tight">Add an allergen</h2>
      {addable.length === 0 ? (
        <p className="mt-4 text-ink-muted">Every catalog allergen is already on your list.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {addable.map((allergen) => (
            <li key={allergen.id} className="flex items-center justify-between py-2">
              <span>{allergen.name}</span>
              <Button variant="ghost" onClick={() => handleAdd(allergen.id)}>
                Add
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  )
}
