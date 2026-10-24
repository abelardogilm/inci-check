import type { ReactNode } from 'react'
import { LanguageToggle } from './LanguageToggle'

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-sm border border-line border-l-4 border-l-ink px-8 py-10">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </div>
    </main>
  )
}
