import { Link } from 'react-router-dom'
import { buttonBase, buttonVariants } from './ui/Button'

const SAMPLE_INGREDIENTS = ['Limonene', 'Linalool', 'Parfum', 'Coumarin']

function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <h1 className="text-5xl font-semibold tracking-tight">inci-check</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Upload a photo of an ingredient list to check it against your allergens.
        </p>
      </div>

      <ul className="flex flex-wrap justify-center gap-2">
        {SAMPLE_INGREDIENTS.map((name) => (
          <li key={name} className="border border-line px-3 py-1 font-mono text-sm text-ink-muted">
            {name}
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <Link to="/signup" className={`${buttonBase} ${buttonVariants.primary}`}>
          Sign up
        </Link>
        <Link to="/login" className={`${buttonBase} ${buttonVariants.ghost}`}>
          Log in
        </Link>
      </div>
    </main>
  )
}

export default App
