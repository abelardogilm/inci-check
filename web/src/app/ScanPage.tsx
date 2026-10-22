import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Button, buttonBase, buttonVariants } from '../ui/Button'
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
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const libraryInputRef = useRef<HTMLInputElement>(null)

  const previews = useMemo(() => images.map((image) => URL.createObjectURL(image)), [images])
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? [])
    setImages((current) => [...current, ...chosen])
    setResult(null)
    setError(null)
    event.target.value = ''
  }

  function handleRemove(index: number) {
    setImages((current) => current.filter((_, i) => i !== index))
  }

  function handleReset() {
    setImages([])
    setResult(null)
    setError(null)
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (libraryInputRef.current) libraryInputRef.current.value = ''
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
        A couple of angles helps if the label is curved or glare-affected.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 border border-dashed border-line px-6 py-8 text-center">
          <span className="font-medium text-ink">Add a photo of the ingredient list</span>
          <div className="mt-2 flex gap-3">
            <label
              htmlFor="camera-photo"
              className={`${buttonBase} ${buttonVariants.primary} cursor-pointer`}
            >
              Take a photo
              <input
                ref={cameraInputRef}
                id="camera-photo"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFilesSelected}
                aria-label="Take a photo"
                className="sr-only"
              />
            </label>
            <label
              htmlFor="library-photos"
              className={`${buttonBase} ${buttonVariants.ghost} cursor-pointer`}
            >
              Choose from library
              <input
                ref={libraryInputRef}
                id="library-photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                aria-label="Choose photos from library"
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {images.length > 0 && (
          <ul className="flex flex-wrap gap-3">
            {images.map((image, index) => (
              <li key={`${image.name}-${index}`} className="relative">
                <img
                  src={previews[index]}
                  alt={image.name}
                  className="h-20 w-20 border border-line object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  aria-label={`Remove ${image.name}`}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center border border-line bg-paper text-ink-muted transition-colors hover:border-flag hover:text-flag"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={images.length === 0 || submitting}>
            {submitting ? 'Scanning…' : 'Scan'}
          </Button>
          {(images.length > 0 || result || error) && (
            <Button type="button" variant="ghost" onClick={handleReset}>
              New scan
            </Button>
          )}
        </div>
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

          {result.extracted_text.length > 0 && (
            <details className="mt-6 border border-line p-3 text-sm">
              <summary className="cursor-pointer text-ink-muted">
                Extracted text (debug)
              </summary>
              <ul className="mt-3 flex flex-col gap-3">
                {result.extracted_text.map((text, index) => (
                  <li key={index} className="font-mono whitespace-pre-wrap text-ink-muted">
                    <span className="text-ink">Image {index + 1}:</span> {text || '(no text read)'}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </AppLayout>
  )
}
