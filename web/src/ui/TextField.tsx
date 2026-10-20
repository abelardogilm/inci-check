import type { InputHTMLAttributes } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string }

export function TextField({ label, className = '', ...props }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink-muted">
      {label}
      <input
        className={`border border-line bg-paper px-3 py-2 font-mono text-base text-ink outline-none transition-colors focus:border-ink ${className}`.trim()}
        {...props}
      />
    </label>
  )
}
