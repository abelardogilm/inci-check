const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 204) {
    return undefined as T
  }

  const body = await response.json()

  if (!response.ok) {
    const message = body.error ?? body.errors?.join(', ') ?? 'Request failed'
    throw new ApiError(message)
  }

  return body as T
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

export function login(username: string, password: string) {
  return request<{ token: string }>('/api/v1/admin/session', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout(token: string) {
  return request<void>('/api/v1/admin/session', {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export interface AllergenAlias {
  id: number
  name: string
}

export interface Allergen {
  id: number
  name: string
  aliases: AllergenAlias[]
  created_at: string
  updated_at: string
}

export function listAllergens(token: string) {
  return request<Allergen[]>('/api/v1/admin/allergens', { headers: authHeaders(token) })
}

export function createAllergen(token: string, name: string) {
  return request<Allergen>('/api/v1/admin/allergens', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  })
}

export function updateAllergen(token: string, id: number, name: string) {
  return request<Allergen>(`/api/v1/admin/allergens/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  })
}

export function deleteAllergen(token: string, id: number) {
  return request<void>(`/api/v1/admin/allergens/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export function addAlias(token: string, allergenId: number, name: string) {
  return request<{ id: number; name: string }>(`/api/v1/admin/allergens/${allergenId}/aliases`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  })
}

export function deleteAlias(token: string, allergenId: number, aliasId: number) {
  return request<void>(`/api/v1/admin/allergens/${allergenId}/aliases/${aliasId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}
