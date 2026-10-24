import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the app heading', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'inci-check' })).toBeInTheDocument()
  })

  it('links to sign up and log in', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup')
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login')
  })

  it('explains how it works in three steps', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'How it works' })).toBeInTheDocument()
    expect(screen.getByText('A photo of the label is read with OCR.')).toBeInTheDocument()
    expect(screen.getByText(/Anything on your personal allergen list/)).toBeInTheDocument()
  })

  it('shows a flagged allergen in the label preview', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Limonene/)).toBeInTheDocument()
  })
})
