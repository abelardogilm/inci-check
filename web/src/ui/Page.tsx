import type { ReactNode } from 'react'

export function Page({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-2xl px-6 py-12">{children}</main>
}
