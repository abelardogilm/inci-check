import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { FormError } from '../ui/FormError'
import * as api from './api'
import { AppLayout } from './AppLayout'
import { useAuth } from './AuthContext'

export function ScanPage() {
  const { token } = useAuth()
  const [images, setImages] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<api.ScanResult | null>(null)

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    setImages(Array.from(event.target.files ?? []))
    setResult(null)
    setError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (images.length === 0) return

    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const scanResult = await api.submitScan(token!, images)
      setResult(scanResult)
    } catch {
      setError('Could not process the submitted photos. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <h1 className="text-3xl font-semibold tracking-tight">Scan a label</h1>
      <p className="mt-2 text-ink-muted">
        Upload a photo of the ingredient list. A couple of angles helps if the label is curved or
        glare-affected.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
          aria-label="Label photos"
          className="text-sm text-ink-muted"
        />

        {images.length > 0 && (
          <ul className="flex flex-wrap gap-2 text-sm text-ink-muted">
            {images.map((image, index) => (
              <li key={`${image.name}-${index}`} className="border border-line px-3 py-1">
                {image.name}
              </li>
            ))}
          </ul>
        )}

        <Button type="submit" disabled={images.length === 0 || submitting}>
          {submitting ? 'Scanning…' : 'Scan'}
        </Button>
      </form>

      {error && (
        <div className="mt-4">
          <FormError>{error}</FormError>
        </div>
      )}

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight">Result</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Read {result.images_processed} of {result.images_processed + result.images_failed}{' '}
            photo(s).
          </p>

          {result.allergens.length === 0 ? (
            <p className="mt-4 text-ink-muted">No allergens found.</p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {result.allergens.map((allergen) => (
                <li
                  key={allergen.id}
                  className={
                    allergen.in_my_list
                      ? 'border border-flag bg-flag-muted px-3 py-1 font-mono text-sm text-flag'
                      : 'border border-line px-3 py-1 font-mono text-sm text-ink-muted'
                  }
                >
                  {allergen.name}
                  {allergen.in_my_list && <span className="ml-1">⚠</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </AppLayout>
  )
}
