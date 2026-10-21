export function FormError({ children }: { children: string }) {
  return (
    <p role="alert" className="border-l-2 border-flag bg-flag-muted px-3 py-2 text-sm text-flag">
      {children}
    </p>
  )
}
