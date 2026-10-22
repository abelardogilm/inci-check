const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

export interface User {
  id: number
  email: string
  last_login_at: string | null
  created_at: string
}

export function signUp(email: string, password: string) {
  return request<User>('/api/v1/app/users', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function login(email: string, password: string) {
  return request<{ token: string }>('/api/v1/app/session', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function logout(token: string) {
  return request<void>('/api/v1/app/session', {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export function getProfile(token: string) {
  return request<User>('/api/v1/app/user', { headers: authHeaders(token) })
}

export interface Allergen {
  id: number
  name: string
}

export function listCatalog(token: string) {
  return request<Allergen[]>('/api/v1/app/allergens', { headers: authHeaders(token) })
}

export function listMyAllergens(token: string) {
  return request<Allergen[]>('/api/v1/app/user_allergens', { headers: authHeaders(token) })
}

export function addMyAllergen(token: string, allergenId: number) {
  return request<Allergen>('/api/v1/app/user_allergens', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ allergen_id: allergenId }),
  })
}

export function removeMyAllergen(token: string, allergenId: number) {
  return request<void>(`/api/v1/app/user_allergens/${allergenId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export interface ScanAllergen extends Allergen {
  in_my_list: boolean
}

export interface ScanResult {
  allergens: ScanAllergen[]
  images_processed: number
  images_failed: number
  extracted_text: string[]
}

export function submitScan(token: string, images: File[]) {
  const body = new FormData()
  images.forEach((image) => body.append('images[]', image))

  return request<ScanResult>('/api/v1/app/scans', {
    method: 'POST',
    headers: authHeaders(token),
    body,
  })
}
