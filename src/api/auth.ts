import { apiRequest } from './client'
import type { ApiEnvelope, AuthResult, Credentials, RegistrationPayload } from './types'

export async function login(credentials: Credentials): Promise<AuthResult> {
  const response = await apiRequest<ApiEnvelope<AuthResult>>('/api/auth/authorization', {
    method: 'POST',
    body: credentials,
  })
  return response.data
}

export async function register(payload: RegistrationPayload): Promise<AuthResult> {
  const response = await apiRequest<ApiEnvelope<AuthResult>>('/api/auth/registration', {
    method: 'POST',
    body: payload,
  })
  return response.data
}
