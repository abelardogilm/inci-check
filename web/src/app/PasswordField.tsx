import { useState } from 'react'

interface PasswordFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
}

export function PasswordField({ label, value, onChange, autoComplete }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <label>
      {label}
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
      />
      <button type="button" onClick={() => setVisible((v) => !v)}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </label>
  )
}
