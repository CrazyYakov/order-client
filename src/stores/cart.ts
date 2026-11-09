import { computed, reactive } from 'vue'
import {
  addToCart as addRequest,
  fetchCart,
  removeFromCart as removeRequest,
} from '@/api/cart'
import type { CartItem } from '@/api/types'
import { useAuth } from './auth'

interface CartState {
  items: CartItem[]
  loading: boolean
  error: string | null
}

const state = reactive<CartState>({
  items: [],
  loading: false,
  error: null,
})

export interface CartProductRef {
  id: number
  title: string
  price: number
}

export function useCart() {
  const { isAuthenticated } = useAuth()

  const count = computed(() => state.items.reduce((sum, item) => sum + item.count, 0))
  const total = computed(() =>
    state.items.reduce((sum, item) => sum + item.price * item.count, 0),
  )

  async function load(): Promise<void> {
    if (!isAuthenticated.value) {
      state.items = []
      return
    }

    state.loading = true
    state.error = null
    try {
      state.items = await fetchCart()
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Не удалось загрузить корзину'
      throw error
    } finally {
      state.loading = false
    }
  }

  function patchLocal(product: CartProductRef, delta: number): void {
    const existing = state.items.find((item) => item.id === product.id)
    const nextCount = (existing?.count ?? 0) + delta

    if (nextCount <= 0) {
      state.items = state.items.filter((item) => item.id !== product.id)
      return
    }

    if (existing) {
      existing.count = nextCount
    } else {
      state.items.push({ ...product, count: nextCount })
    }
  }

  async function add(product: CartProductRef): Promise<void> {
    await addRequest(product.id)
    patchLocal(product, 1)
  }

  async function remove(product: CartProductRef): Promise<void> {
    await removeRequest(product.id)
    patchLocal(product, -1)
  }

  async function removeAll(product: CartProductRef): Promise<void> {
    const existing = state.items.find((item) => item.id === product.id)
    if (!existing) return

    for (let i = 0; i < existing.count; i += 1) {
      await removeRequest(product.id)
    }
    state.items = state.items.filter((item) => item.id !== product.id)
  }

  function clear(): void {
    state.items = []
  }

  return {
    state,
    count,
    total,
    load,
    add,
    remove,
    removeAll,
    clear,
  }
}
