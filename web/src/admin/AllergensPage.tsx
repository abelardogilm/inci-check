import { useCallback, useEffect, useState, type FormEvent } from 'react'
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
    <main>
      <h1>Allergens</h1>
      <button type="button" onClick={logout}>
        Log out
      </button>

      <form onSubmit={handleCreate}>
        <label>
          New allergen name
          <input value={newName} onChange={(event) => setNewName(event.target.value)} />
        </label>
        <button type="submit">Add allergen</button>
      </form>
      {error && <p role="alert">{error}</p>}

      <ul>
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
    </main>
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
    <li>
      <strong>{allergen.name}</strong>
      <button type="button" onClick={onDelete}>
        Delete
      </button>

      <ul>
        {allergen.aliases.map((aliasRecord) => (
          <li key={aliasRecord.id}>
            {aliasRecord.name}
            <button type="button" onClick={() => onDeleteAlias(aliasRecord.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddAlias}>
        <label>
          New alias for {allergen.name}
          <input value={newAlias} onChange={(event) => setNewAlias(event.target.value)} />
        </label>
        <button type="submit">Add alias</button>
      </form>
    </li>
  )
}
