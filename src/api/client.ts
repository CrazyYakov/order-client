const TOKEN_KEY = 'shop:token'
const USER_ID_KEY = 'shop:user-id'

export const AUTH_EXPIRED_EVENT = 'shop:auth-expired'

export class ApiError extends Error {
  readonly status: number
  readonly errors: Record<string, string[]>

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getUserId(): number | null {
  const raw = localStorage.getItem(USER_ID_KEY)
  const parsed = raw === null ? Number.NaN : Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export function setUserId(id: number | null): void {
  if (id === null) {
    localStorage.removeItem(USER_ID_KEY)
  } else {
    localStorage.setItem(USER_ID_KEY, String(id))
  }
}

type QueryValue = string | number | boolean | null | undefined

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Record<string, QueryValue>
  signal?: AbortSignal
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  if (!query) return path

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') continue
    params.append(key, String(value))
  }

  const search = params.toString()
  return search ? `${path}?${search}` : path
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readValidationErrors(payload: unknown): Record<string, string[]> {
  if (!isRecord(payload) || !isRecord(payload.errors)) return {}

  const result: Record<string, string[]> = {}
  for (const [field, messages] of Object.entries(payload.errors)) {
    if (Array.isArray(messages)) {
      result[field] = messages.filter((message): message is string => typeof message === 'string')
    }
  }
  return result
}

function readMessage(payload: unknown, fallback: string): string {
  if (isRecord(payload) && typeof payload.message === 'string' && payload.message) {
    return payload.message
  }
  return fallback
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = getToken()

  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, 'Сервер недоступен. Проверьте подключение к сети.')
  }

  const payload = await parseBody(response)

  if (!response.ok) {
    if (response.status === 401 && token) {
      setToken(null)
      setUserId(null)
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
    }

    // Для 5xx бэкенд отдаёт трассировку Laravel — показываем нейтральный текст.
    const message =
      response.status >= 500
        ? 'Сервер временно недоступен. Попробуйте повторить позже.'
        : readMessage(payload, `Ошибка запроса (${response.status})`)

    throw new ApiError(response.status, message, readValidationErrors(payload))
  }

  return payload as T
}
