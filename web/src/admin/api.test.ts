import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createAllergen, login } from './api'

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

      const result = await login('admin', 'secret')

      expect(result.token).toBe('abc123')
    })

    it('throws an ApiError with the server message on failure', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Invalid username or password' }),
        }),
      )

      await expect(login('admin', 'wrong')).rejects.toThrow(ApiError)
      await expect(login('admin', 'wrong')).rejects.toThrow('Invalid username or password')
    })
  })

  describe('createAllergen', () => {
    it('joins validation errors into the thrown message', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 422,
          json: async () => ({ errors: ["Name can't be blank"] }),
        }),
      )

      await expect(createAllergen('token', '')).rejects.toThrow("Name can't be blank")
    })
  })
})
