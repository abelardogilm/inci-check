import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, login, signUp } from './api'

describe('api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('login', () => {
    it('returns the token on success', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 201,
          json: async () => ({ token: 'abc123' }),
        }),
      )

      const result = await login('someone@example.com', 'secret')

      expect(result.token).toBe('abc123')
    })

    it('throws an ApiError with the server message on failure', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Invalid email or password' }),
        }),
      )

      await expect(login('someone@example.com', 'wrong')).rejects.toThrow(ApiError)
      await expect(login('someone@example.com', 'wrong')).rejects.toThrow(
        'Invalid email or password',
      )
    })
  })

  describe('signUp', () => {
    it('joins validation errors into the thrown message', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 422,
          json: async () => ({ errors: ['Password is too short (minimum is 8 characters)'] }),
        }),
      )

      await expect(signUp('someone@example.com', 'short')).rejects.toThrow(
        'Password is too short (minimum is 8 characters)',
      )
    })
  })
})
