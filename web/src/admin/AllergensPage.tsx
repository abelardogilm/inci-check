import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { FormError } from '../ui/FormError'
import { Page } from '../ui/Page'
import { TextField } from '../ui/TextField'
import * as api from './api'
import { useAuth } from './AuthContext'

export function AllergensPage() {
  const { token, logout } = useAuth()
  const [allergens, setAllergens] = useState<api.Allergen[]>([])
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const data = await api.listAllergens(token!)
    setAllergens(data)
  }, [token])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setError(null)

    try {
      await api.createAllergen(token!, newName)
      setNewName('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  async function handleDelete(id: number) {
    await api.deleteAllergen(token!, id)
    await refresh()
  }

  async function handleAddAlias(allergenId: number, name: string) {
    await api.addAlias(token!, allergenId, name)
    await refresh()
  }

  async function handleDeleteAlias(allergenId: number, aliasId: number) {
    await api.deleteAlias(token!, allergenId, aliasId)
    await refresh()
  }

  return (
    <Page>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Allergens</h1>
        <Button variant="ghost" onClick={logout}>
          Log out
        </Button>
      </div>

      <form onSubmit={handleCreate} className="mt-8 flex items-end gap-2">
        <div className="flex-1">
          <TextField
            label="New allergen name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
          />
        </div>
        <Button type="submit">Add allergen</Button>
      </form>
      {error && (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      )}

      <ul className="mt-8 border-t border-line">
        {allergens.map((allergen) => (
          <AllergenRow
            key={allergen.id}
            allergen={allergen}
            onDelete={() => handleDelete(allergen.id)}
            onAddAlias={(name) => handleAddAlias(allergen.id, name)}
            onDeleteAlias={(aliasId) => handleDeleteAlias(allergen.id, aliasId)}
          />
        ))}
      </ul>
    </Page>
  )
}

function AllergenRow({
  allergen,
  onDelete,
  onAddAlias,
  onDeleteAlias,
}: {
  allergen: api.Allergen
  onDelete: () => void
  onAddAlias: (name: string) => void
  onDeleteAlias: (aliasId: number) => void
}) {
  const [newAlias, setNewAlias] = useState('')

  function handleAddAlias(event: FormEvent) {
    event.preventDefault()
    onAddAlias(newAlias)
    setNewAlias('')
  }

  return (
    <li className="border-b border-line py-5">
      <div className="flex items-center justify-between gap-4">
        <strong className="text-lg font-medium">{allergen.name}</strong>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>

      {allergen.aliases.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {allergen.aliases.map((aliasRecord) => (
            <li
              key={aliasRecord.id}
              className="flex items-center gap-2 border border-line px-2 py-1 font-mono text-xs text-ink-muted"
            >
              {aliasRecord.name}
              <button
                type="button"
                onClick={() => onDeleteAlias(aliasRecord.id)}
                aria-label={`Remove alias ${aliasRecord.name}`}
                className="text-ink-muted transition-colors hover:text-flag"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddAlias} className="mt-3 flex items-end gap-2">
        <div className="flex-1">
          <TextField
            label={`New alias for ${allergen.name}`}
            value={newAlias}
            onChange={(event) => setNewAlias(event.target.value)}
          />
        </div>
        <Button type="submit" variant="ghost">
          Add alias
        </Button>
      </form>
    </li>
  )
}
