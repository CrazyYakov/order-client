import { computed, reactive } from 'vue'
import { login as loginRequest, register as registerRequest } from '@/api/auth'
import {
  AUTH_EXPIRED_EVENT,
  getToken,
  getUserId,
  setToken,
  setUserId,
} from '@/api/client'
import type { Credentials, RegistrationPayload } from '@/api/types'

interface AuthState {
  token: string | null
  userId: number | null
}

const state = reactive<AuthState>({
  token: getToken(),
  userId: getUserId(),
})

function applySession(token: string | null, userId: number | null): void {
  state.token = token
  state.userId = userId
  setToken(token)
  setUserId(userId)
}

let subscribed = false

export function useAuth() {
  if (!subscribed) {
    subscribed = true
    window.addEventListener(AUTH_EXPIRED_EVENT, () => {
      state.token = null
      state.userId = null
    })
  }

  const isAuthenticated = computed(() => Boolean(state.token))

  async function login(credentials: Credentials): Promise<void> {
    const result = await loginRequest(credentials)
    applySession(result.token, result.id)
  }

  async function register(payload: RegistrationPayload): Promise<void> {
    const result = await registerRequest(payload)
    applySession(result.token, result.id)
  }

  function logout(): void {
    applySession(null, null)
  }

  return {
    state,
    isAuthenticated,
    login,
    register,
    logout,
  }
}
