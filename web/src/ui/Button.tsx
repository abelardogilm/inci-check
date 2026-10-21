import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

export const buttonBase = 'px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50'

export const buttonVariants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink/90',
  ghost: 'border border-line text-ink hover:border-ink',
  danger: 'border border-line text-flag hover:border-flag hover:bg-flag hover:text-paper',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button className={`${buttonBase} ${buttonVariants[variant]} ${className}`.trim()} {...props} />
  )
}
